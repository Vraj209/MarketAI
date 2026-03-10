import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import { getOpenAIClient } from "@/lib/integrations/openai/client";
import type { FinancialPeriod } from "@/lib/validations/financial-report";

const MAX_PDF_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") ?? formData.get("pdf");
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "Missing file. Upload a PDF using the 'file' or 'pdf' field." },
      { status: 400 },
    );
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "File must be a PDF (application/pdf)." }, { status: 400 });
  }

  if (file.size > MAX_PDF_BYTES) {
    return NextResponse.json(
      { error: `PDF must be under ${MAX_PDF_BYTES / 1024 / 1024} MB.` },
      { status: 400 },
    );
  }

  let buffer: Buffer;
  try {
    const bytes = await file.arrayBuffer();
    buffer = Buffer.from(bytes);
  } catch {
    return NextResponse.json({ error: "Failed to read file" }, { status: 400 });
  }

  let pdfText: string;
  try {
    // Load lib directly to avoid index.js test block that reads ./test/data/05-versions-space.pdf
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- CJS lib, no types for subpath
    const pdf = require("pdf-parse/lib/pdf-parse.js") as (
      buffer: Buffer,
    ) => Promise<{ text: string }>;
    const data = await pdf(buffer);
    pdfText = data?.text ?? "";
  } catch (err) {
    const message = err instanceof Error ? err.message : "PDF parsing failed";
    return NextResponse.json(
      { error: `Could not extract text from PDF: ${message}` },
      { status: 422 },
    );
  }

  if (!pdfText.trim()) {
    return NextResponse.json(
      { error: "No text could be extracted from the PDF. It may be scanned or image-only." },
      { status: 422 },
    );
  }

  const client = getOpenAIClient();
  const truncated = pdfText.slice(0, 28000);

  try {
    const response = await client.responses.create({
      model: "gpt-4.1",
      input: [
        {
          role: "system",
          content:
            "You extract financial statement data from text. Return only valid JSON with this shape: { \"periodType\": \"monthly\" | \"quarterly\" | \"annual\", \"periods\": [ { \"label\": string, \"revenue\": number, \"expenses\": number, \"marketingSpend\": number } ] }. Infer periodType from the document. Use 0 for any missing numbers. Keep label short (e.g. Q1, Jan 2024).",
        },
        {
          role: "user",
          content: `Extract period-by-period financial data from this document. Return JSON only.\n\n${truncated}`,
        },
      ],
    });

    const raw = response.output_text?.trim() ?? "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : raw;
    const parsed = JSON.parse(jsonStr) as {
      periodType?: "monthly" | "quarterly" | "annual";
      periods?: Array<{ label?: string; revenue?: number; expenses?: number; marketingSpend?: number }>;
    };

    const periodType = parsed.periodType ?? "quarterly";
    const rawPeriods = Array.isArray(parsed.periods) ? parsed.periods : [];
    const periods: FinancialPeriod[] = rawPeriods.map((p) => ({
      label: String(p?.label ?? "").trim() || "Period",
      revenue: Number(p?.revenue) || 0,
      expenses: Number(p?.expenses) || 0,
      marketingSpend: Number(p?.marketingSpend) ?? 0,
    }));

    if (periods.length === 0) {
      return NextResponse.json(
        { error: "No financial periods could be identified in the PDF." },
        { status: 422 },
      );
    }

    return NextResponse.json({ periodType, periods });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI extraction failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
