import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { SESSION_COOKIE_NAME } from "@/lib/auth/session";

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = signInSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid credentials payload" }, { status: 400 });
  }

  const allowedEmail = process.env.AUTH_DEMO_EMAIL ?? "owner@example.com";
  const allowedPassword = process.env.AUTH_DEMO_PASSWORD ?? "password123";

  if (
    parsed.data.email !== allowedEmail ||
    parsed.data.password !== allowedPassword
  ) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, parsed.data.email, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return NextResponse.json({ ok: true });
}
