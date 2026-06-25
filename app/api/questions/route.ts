import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { createQuestion, listQuestions } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { sha256Hex } from "@/lib/crypto";
import { hitRateLimit } from "@/lib/rate-limit";
import { saveAttachment } from "@/lib/r2";
import { questionSchema } from "@/lib/validators";
import { verifyTurnstile } from "@/lib/turnstile";

export const runtime = "edge";

function clientIp(request: NextRequest) {
  return request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

export async function GET(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const status = request.nextUrl.searchParams.get("status") ?? "pending";
  const questions = await listQuestions(status);
  return NextResponse.json({ questions });
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  let payload: unknown;
  let attachment: File | null = null;
  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    payload = {
      nickname: form.get("nickname"),
      content: form.get("content"),
      turnstileToken: form.get("turnstileToken") || form.get("cf-turnstile-response")
    };
    const maybeFile = form.get("attachment");
    attachment = maybeFile instanceof File ? maybeFile : null;
  } else {
    payload = await request.json().catch(() => null);
  }

  const parsed = questionSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "问题内容需要 5 到 1000 个字符。" }, { status: 400 });
  }

  const ip = clientIp(request);
  const ipHash = ip ? await sha256Hex(ip) : "unknown";
  if (await hitRateLimit(ipHash)) {
    return NextResponse.json({ error: "提交太频繁了，请稍后再试。" }, { status: 429 });
  }

  const passed = await verifyTurnstile(parsed.data.turnstileToken ?? null, ip);
  if (!passed) {
    return NextResponse.json({ error: "人机验证失败，请刷新后重试。" }, { status: 400 });
  }

  const id = nanoid(16);
  const attachmentKey = await saveAttachment(attachment, id).catch((error: Error) => {
    if (attachment) throw error;
    return null;
  });

  await createQuestion({
    id,
    nickname: parsed.data.nickname || null,
    content: parsed.data.content,
    ipHash,
    userAgent: request.headers.get("user-agent"),
    attachmentKey
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
