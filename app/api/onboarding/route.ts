import { NextResponse } from "next/server";

import { BusinessService } from "@/features/business/server/business-service";
import { businessOnboardingSchema } from "@/features/business/schemas/onboarding";
import { getSession } from "@/lib/auth/session";

const businessService = new BusinessService();

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = businessOnboardingSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const savedProfile = await businessService.saveOnboarding(
    session.workspaceId,
    parsed.data,
  );
  return NextResponse.json({ data: savedProfile });
}
