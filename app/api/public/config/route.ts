import { getCloudflareEnv } from "@/lib/cloudflare";
import { getEnv } from "@/lib/env";
import { getPublicAlgoliaConfig } from "@/lib/algolia-config";
import { getFreshSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const [settings, env, algoliaConfig] = await Promise.all([getFreshSiteSettings(), getCloudflareEnv(), getPublicAlgoliaConfig()]);
  return Response.json({
    settings,
    siteKey: env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? getEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY"),
    algoliaConfig,
  }, { headers: { "Cache-Control": "no-store" } });
}
