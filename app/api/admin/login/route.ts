import { NextRequest, NextResponse } from "next/server";
import { createSessionCookie, setSession, verifyPassword } from "@/lib/auth";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const password = String(form.get("password") ?? "");
  if (!(await verifyPassword(password))) {
    return NextResponse.redirect(new URL("/admin?error=1", request.url), 303);
  }
  await setSession(await createSessionCookie());
  return NextResponse.redirect(new URL("/admin", request.url), 303);
}
