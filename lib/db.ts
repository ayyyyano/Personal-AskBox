import { getCloudflareEnv } from "./cloudflare";
import { getEnv } from "./env";

type D1Result<T> = {
  results?: T[];
  success?: boolean;
  meta?: unknown;
  error?: string;
};

export type QuestionStatus = "pending" | "answered" | "published" | "archived";

export type Question = {
  id: string;
  nickname: string | null;
  content: string;
  answer: string | null;
  status: QuestionStatus;
  ip_hash: string | null;
  user_agent: string | null;
  attachment_key: string | null;
  created_at: string;
  answered_at: string | null;
  published_at: string | null;
};

async function d1Query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  const env = await getCloudflareEnv();
  if (env.DB) {
    const result = await env.DB.prepare(sql).bind(...params).all<T>();
    return result.results ?? [];
  }

  const accountId = getEnv("CLOUDFLARE_ACCOUNT_ID");
  const token = getEnv("CLOUDFLARE_API_TOKEN");
  const databaseId = getEnv("CLOUDFLARE_D1_DATABASE_ID");
  if (!accountId || !token || !databaseId) {
    throw new Error("D1 is not configured. Set Cloudflare bindings or CLOUDFLARE_* env vars.");
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ sql, params })
    }
  );
  const json = (await response.json()) as { success: boolean; result?: D1Result<T>[]; errors?: { message: string }[] };
  if (!json.success) {
    throw new Error(json.errors?.[0]?.message ?? "Cloudflare D1 query failed");
  }
  return json.result?.[0]?.results ?? [];
}

export async function createQuestion(question: {
  id: string;
  nickname: string | null;
  content: string;
  ipHash: string | null;
  userAgent: string | null;
  attachmentKey?: string | null;
}) {
  await d1Query(
    "INSERT INTO questions (id, nickname, content, ip_hash, user_agent, attachment_key) VALUES (?, ?, ?, ?, ?, ?)",
    [question.id, question.nickname, question.content, question.ipHash, question.userAgent, question.attachmentKey ?? null]
  );
}

export async function listQuestions(status?: string): Promise<Question[]> {
  if (status && status !== "all") {
    return d1Query<Question>(
      "SELECT * FROM questions WHERE status = ? ORDER BY created_at DESC LIMIT 100",
      [status]
    );
  }
  return d1Query<Question>("SELECT * FROM questions ORDER BY created_at DESC LIMIT 100");
}

export async function listPublishedQuestions(): Promise<Question[]> {
  return d1Query<Question>(
    "SELECT * FROM questions WHERE status = 'published' ORDER BY published_at DESC LIMIT 50"
  );
}

export async function answerQuestion(id: string, answer: string, publish: boolean) {
  await d1Query(
    "UPDATE questions SET answer = ?, status = ?, answered_at = COALESCE(answered_at, CURRENT_TIMESTAMP), published_at = CASE WHEN ? THEN CURRENT_TIMESTAMP ELSE published_at END WHERE id = ?",
    [answer, publish ? "published" : "answered", publish ? 1 : 0, id]
  );
}
