import { cookies } from "next/headers";
import { getCloudflareEnv } from "./cloudflare";
import { getEnv } from "./env";
import { decodeJson, encodeJson, hmacSign, sha256Hex } from "./crypto";

const cookieName = "askbox_session";
const localDefaultAdminPassword = "admin";

type SessionPayload = {
  role: "admin";
  exp: number;
};

async function sessionSecret() {
  const env = await getCloudflareEnv();
  return env.SESSION_SECRET ?? getEnv("SESSION_SECRET", "dev-secret-change-me");
}

export async function verifyPassword(password: string) {
  const env = await getCloudflareEnv();
  const expectedHash = env.ADMIN_PASSWORD_HASH ?? getEnv("ADMIN_PASSWORD_HASH");
  if (expectedHash) {
    return (await sha256Hex(password)) === expectedHash;
  }
  const configuredPassword = env.ADMIN_PASSWORD ?? getEnv("ADMIN_PASSWORD");
  if (configuredPassword) return password === configuredPassword;

  // 只在本地开发时提供便于体验的默认密码，生产环境未配置密码时拒绝登录。
  return process.env.NODE_ENV === "development" && password === localDefaultAdminPassword;
}

export async function createSessionCookie() {
  const payload: SessionPayload = { role: "admin", exp: Date.now() + 1000 * 60 * 60 * 24 * 7 };
  const body = encodeJson(payload);
  const signature = await hmacSign(await sessionSecret(), body);
  return `${body}.${signature}`;
}

export async function isAdmin() {
  const store = await cookies();
  const raw = store.get(cookieName)?.value;
  if (!raw) return false;
  const [body, signature] = raw.split(".");
  if (!body || !signature) return false;
  const expected = await hmacSign(await sessionSecret(), body);
  if (signature !== expected) return false;
  try {
    const payload = decodeJson<SessionPayload>(body);
    return payload.role === "admin" && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export async function setSession(value: string) {
  const store = await cookies();
  store.set(cookieName, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(cookieName);
}
