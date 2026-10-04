import { getCloudflareEnv } from "./cloudflare";
import { nanoid } from "nanoid";

const allowedTypes = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const siteAssetTypes = {
  favicon: new Set(["image/png", "image/jpeg", "image/webp", "image/x-icon", "image/vnd.microsoft.icon"]),
  logo: new Set(["image/png", "image/jpeg", "image/webp"]),
  background: new Set(["image/png", "image/jpeg", "image/webp"]),
} as const;
const siteAssetLimits = { favicon: 1 * 1024 * 1024, logo: 2 * 1024 * 1024, background: 4 * 1024 * 1024 } as const;

type SiteAssetKind = keyof typeof siteAssetTypes;

function assetLabel(kind: SiteAssetKind) {
  if (kind === "favicon") return "头像";
  if (kind === "logo") return "Logo";
  return "背景图";
}

function imageDimensions(bytes: Uint8Array, type: string) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (type === "image/png" && bytes.length >= 24) {
    return { width: view.getUint32(16), height: view.getUint32(20) };
  }

  if (type === "image/jpeg" && bytes.length >= 4) {
    let offset = 2;
    const startOfFrameMarkers = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
    while (offset + 8 < bytes.length) {
      if (bytes[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      const marker = bytes[offset + 1];
      if (startOfFrameMarkers.has(marker)) {
        return { width: view.getUint16(offset + 7), height: view.getUint16(offset + 5) };
      }
      if (marker === 0xd8 || marker === 0xd9) {
        offset += 2;
        continue;
      }
      const segmentLength = view.getUint16(offset + 2);
      if (segmentLength < 2) break;
      offset += 2 + segmentLength;
    }
  }

  if (type === "image/webp" && bytes.length >= 30) {
    const chunk = String.fromCharCode(bytes[12], bytes[13], bytes[14], bytes[15]);
    if (chunk === "VP8X") {
      const width = 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16);
      const height = 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16);
      return { width, height };
    }
    if (chunk === "VP8 " && bytes.length >= 30) {
      return { width: view.getUint16(26, true) & 0x3fff, height: view.getUint16(28, true) & 0x3fff };
    }
    if (chunk === "VP8L" && bytes.length >= 25 && bytes[20] === 0x2f) {
      const width = 1 + bytes[21] + ((bytes[22] & 0x3f) << 8);
      const height = 1 + (bytes[22] >> 6) + (bytes[23] << 2) + ((bytes[24] & 0x0f) << 10);
      return { width, height };
    }
  }

  return null;
}

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

export async function saveSiteAsset(file: File | null, kind: SiteAssetKind) {
  if (!file || file.size === 0) throw new Error("请选择图片文件。");
  if (file.size > siteAssetLimits[kind]) {
    throw new Error(`${assetLabel(kind)}文件不能超过 ${siteAssetLimits[kind] / 1024 / 1024}MB。`);
  }
  if (!siteAssetTypes[kind].has(file.type as never)) {
    throw new Error(kind === "favicon" ? "头像仅支持 PNG、JPG、WEBP 或 ICO。" : `${assetLabel(kind)}仅支持 PNG、JPG 或 WEBP。`);
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (kind === "favicon" && file.type !== "image/x-icon" && file.type !== "image/vnd.microsoft.icon") {
    const dimensions = imageDimensions(bytes, file.type);
    if (!dimensions || dimensions.width !== dimensions.height) throw new Error("头像必须使用方形图片。");
  }

  const env = await getCloudflareEnv();
  if (!env.ASKBOX_R2) throw new Error("R2 binding is not configured for site assets.");

  const extension = file.type === "image/jpeg"
    ? "jpg"
    : file.type === "image/x-icon" || file.type === "image/vnd.microsoft.icon"
      ? "ico"
      : file.type.split("/")[1] ?? "bin";
  const key = `site-assets/${kind}/${nanoid(16)}.${extension}`;
  await env.ASKBOX_R2.put(key, bytes, {
    httpMetadata: { contentType: file.type },
    customMetadata: { originalName: file.name },
  });
  return { key, type: file.type };
}
