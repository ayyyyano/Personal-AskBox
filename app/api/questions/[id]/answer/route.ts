import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { answerQuestion } from "@/lib/db";
import { answerSchema } from "@/lib/validators";

export const runtime = "edge";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const json = await request.json().catch(() => null);
  const parsed = answerSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "回答不能为空。" }, { status: 400 });
  }
  const { id } = await context.params;
  await answerQuestion(id, parsed.data.answer, parsed.data.publish);
  return NextResponse.json({ ok: true });
}
