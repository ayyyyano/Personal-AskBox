import { listPublishedQuestions } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const questions = await listPublishedQuestions();
    return Response.json({ questions }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "公开问答加载失败，请稍后重试。" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
