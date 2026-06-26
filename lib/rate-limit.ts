import { kvGet, kvPut } from "./kv";

export async function hitRateLimit(key: string, limit = 20, windowSeconds = 3600) {
  const now = Date.now();
  const raw = await kvGet(`ratelimit:${key}`);
  const state = raw ? (JSON.parse(raw) as { count: number; resetAt: number }) : null;

  if (!state || state.resetAt <= now) {
    await kvPut(`ratelimit:${key}`, JSON.stringify({ count: 1, resetAt: now + windowSeconds * 1000 }), windowSeconds);
    return false;
  }

  if (state.count >= limit) return true;
  await kvPut(`ratelimit:${key}`, JSON.stringify({ count: state.count + 1, resetAt: state.resetAt }), windowSeconds);
  return false;
}
