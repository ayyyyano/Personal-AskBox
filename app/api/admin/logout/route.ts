import { NextRequest, NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  await clearSession();
  return NextResponse.redirect(new URL("/", request.url), 303);
}
