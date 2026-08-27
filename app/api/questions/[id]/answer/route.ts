import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { answerQuestion } from "@/lib/db";
import { answerSchema } from "@/lib/validators";
import { partialUpdateQuestion } from "@/lib/algolia-admin";

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
  const answeredAt = new Date().toISOString().replace("T", " ").slice(0, 19);
  await partialUpdateQuestion(id, {
    answer: parsed.data.answer,
    status: parsed.data.publish ? "published" : "answered",
    answered_at: answeredAt,
    published_at: parsed.data.publish ? new Date().toISOString().replace("T", " ").slice(0, 19) : undefined,
  });
  return NextResponse.json({ ok: true });
}
