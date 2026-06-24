import type { D1Database, KVNamespace, R2Bucket } from "@cloudflare/workers-types";

export type CloudflareEnv = {
  DB?: D1Database;
  ASKBOX_KV?: KVNamespace;
  ASKBOX_R2?: R2Bucket;
  SITE_NAME?: string;
  SESSION_SECRET?: string;
  ADMIN_PASSWORD?: string;
  ADMIN_PASSWORD_HASH?: string;
  TURNSTILE_SECRET_KEY?: string;
  NEXT_PUBLIC_TURNSTILE_SITE_KEY?: string;
};

export function getEnv(name: string, fallback = "") {
  return process.env[name] ?? fallback;
}

export function siteName() {
  return getEnv("SITE_NAME", "个人提问箱");
}
