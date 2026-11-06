import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getCloudflareEnv } from "@/lib/cloudflare";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const env = await getCloudflareEnv();
  if (!env.ASKBOX_R2) {
    return NextResponse.json({ error: "R2 not configured" }, { status: 500 });
  }
  const db = env.DB;
  if (!db) {
    return NextResponse.json({ error: "DB not configured" }, { status: 500 });
  }
  const admin = await isAdmin();
  const result = admin
    ? await db.prepare("SELECT attachment_key FROM questions WHERE id = ?").bind(id).first<{ attachment_key: string | null }>()
    : await db.prepare("SELECT attachment_key FROM questions WHERE id = ? AND status = 'published'").bind(id).first<{ attachment_key: string | null }>();
  if (!result?.attachment_key) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const object = await env.ASKBOX_R2.get(result.attachment_key);
  if (!object) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return new Response(object.body as ReadableStream, {
    status: 200,
    headers: {
      "Content-Type": object.httpMetadata?.contentType ?? "application/octet-stream",
      "Cache-Control": admin ? "private, no-store" : "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
