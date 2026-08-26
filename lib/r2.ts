import { getCloudflareEnv } from "./cloudflare";
import { nanoid } from "nanoid";

const allowedTypes = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const siteAssetTypes = {
  favicon: new Set(["image/png", "image/jpeg", "image/webp", "image/x-icon", "image/vnd.microsoft.icon"]),
  background: new Set(["image/png", "image/jpeg", "image/webp"]),
} as const;
const siteAssetLimits = { favicon: 1 * 1024 * 1024, background: 4 * 1024 * 1024 } as const;

export async function saveAttachment(file: File | null, id: string) {
  if (!file || file.size === 0) return null;
  if (file.size > 4 * 1024 * 1024) throw new Error("附件不能超过 4MB。");
  if (!allowedTypes.has(file.type)) throw new Error("附件仅支持 PNG、JPG、WEBP 或 GIF。");

  const env = await getCloudflareEnv();
  if (!env.ASKBOX_R2) {
    throw new Error("R2 binding is not configured for attachment uploads.");
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const key = `questions/${id}.${extension}`;
  await env.ASKBOX_R2.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
    customMetadata: { originalName: file.name }
  });
  return key;
}

export async function deleteAttachment(key: string | null) {
  if (!key) return;
  const env = await getCloudflareEnv();
  if (!env.ASKBOX_R2) return;
  await env.ASKBOX_R2.delete(key);
}

export async function saveSiteAsset(file: File | null, kind: "favicon" | "background") {
  if (!file || file.size === 0) throw new Error("请选择图片文件。");
  if (file.size > siteAssetLimits[kind]) {
    throw new Error(`${kind === "favicon" ? "头像" : "背景图"}文件不能超过 ${kind === "favicon" ? "1MB" : "4MB"}。`);
  }
  if (!siteAssetTypes[kind].has(file.type as never)) {
    throw new Error(kind === "favicon" ? "头像仅支持 PNG、JPG、WEBP 或 ICO。" : "背景图仅支持 PNG、JPG 或 WEBP。");
  }

  const env = await getCloudflareEnv();
  if (!env.ASKBOX_R2) throw new Error("R2 binding is not configured for site assets.");

  const extension = file.type === "image/jpeg"
    ? "jpg"
    : file.type === "image/x-icon" || file.type === "image/vnd.microsoft.icon"
      ? "ico"
      : file.type.split("/")[1] ?? "bin";
  const key = `site-assets/${kind}/${nanoid(16)}.${extension}`;
  await env.ASKBOX_R2.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
    customMetadata: { originalName: file.name },
  });
  return { key, type: file.type };
}
