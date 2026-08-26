import { NextRequest, NextResponse } from "next/server";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { getSiteSettings } from "@/lib/site-settings";

const kinds = new Set(["favicon", "background"]);
const contentTypes = new Set(["image/png", "image/jpeg", "image/webp", "image/x-icon", "image/vnd.microsoft.icon"]);

type AssetKind = "favicon" | "background";

export async function GET(_request: NextRequest, context: { params: Promise<{ kind: string }> }) {
  const { kind } = await context.params;
  if (!kinds.has(kind)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const settings = await getSiteSettings();
  const key = kind === "favicon" ? settings.faviconKey : settings.backgroundKey;
  const contentType = kind === "favicon" ? settings.faviconType : settings.backgroundType;
  if (!key || !contentType || !contentTypes.has(contentType)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const env = await getCloudflareEnv();
  if (!env.ASKBOX_R2) return NextResponse.json({ error: "R2 not configured" }, { status: 500 });
  const object = await env.ASKBOX_R2.get(key);
  if (!object) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const buffer = await object.arrayBuffer();
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": `public, max-age=31536000, immutable`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
