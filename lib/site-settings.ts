import { cache } from "react";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { getEnv } from "@/lib/env";

import { DEFAULT_SITE_SETTINGS, normalizeSiteSettings, type SiteSettings, type SiteSettingsRow } from "./site-settings-public";
export * from "./site-settings-public";

async function querySettings<T>(sql: string, params: unknown[] = []) {
  const env = await getCloudflareEnv();
  if (env.DB) {
    const result = await env.DB.prepare(sql).bind(...params).all<T>();
    return result.results?.[0] ?? null;
  }

  const accountId = getEnv("CLOUDFLARE_ACCOUNT_ID");
  const token = getEnv("CLOUDFLARE_API_TOKEN");
  const databaseId = getEnv("CLOUDFLARE_D1_DATABASE_ID");
  if (!accountId || !token || !databaseId) throw new Error("D1 is not configured.");

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ sql, params }),
    },
  );
  const json = (await response.json()) as { success: boolean; result?: { results?: T[] }[]; errors?: { message: string }[] };
  if (!json.success) throw new Error(json.errors?.[0]?.message ?? "Cloudflare D1 query failed");
  return json.result?.[0]?.results?.[0] ?? null;
}

async function executeSettings(sql: string, params: unknown[] = []) {
  const env = await getCloudflareEnv();
  if (env.DB) {
    return env.DB.prepare(sql).bind(...params).run();
  }

  const accountId = getEnv("CLOUDFLARE_ACCOUNT_ID");
  const token = getEnv("CLOUDFLARE_API_TOKEN");
  const databaseId = getEnv("CLOUDFLARE_D1_DATABASE_ID");
  if (!accountId || !token || !databaseId) throw new Error("D1 is not configured.");

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ sql, params }),
    },
  );
  const json = (await response.json()) as { success: boolean; errors?: { message: string }[] };
  if (!json.success) throw new Error(json.errors?.[0]?.message ?? "Cloudflare D1 query failed");
}

async function ensureSettingsRow() {
  await executeSettings("INSERT OR IGNORE INTO site_settings (id) VALUES (1)");
}

async function readSiteSettings(): Promise<SiteSettings> {
  try {
    const row = await querySettings<SiteSettingsRow>("SELECT * FROM site_settings WHERE id = 1");
    return normalizeSiteSettings(row);
  } catch {
    return normalizeSiteSettings();
  }
}

export const getSiteSettings = cache(readSiteSettings);

export async function getFreshSiteSettings() {
  return readSiteSettings();
}

export async function updateSiteSettings(settings: SiteSettings) {
  await ensureSettingsRow();
  const params = [
    settings.siteName,
    settings.askTitle,
    settings.primaryColor,
    settings.faviconKey,
    settings.faviconType,
    settings.logoKey,
    settings.logoType,
    settings.brandMode,
    settings.backgroundKey,
    settings.backgroundType,
    settings.copyrightName,
    settings.topBarOpacity,
    settings.navigationOpacity,
    settings.cardOpacity,
    settings.backgroundOpacity,
  ];
  await executeSettings(
    "UPDATE site_settings SET site_name = ?, ask_title = ?, primary_color = ?, favicon_key = ?, favicon_type = ?, logo_key = ?, logo_type = ?, brand_mode = ?, background_key = ?, background_type = ?, copyright_name = ?, top_bar_opacity = ?, navigation_opacity = ?, card_opacity = ?, background_opacity = ?, revision = revision + 1, updated_at = CURRENT_TIMESTAMP WHERE id = 1",
    params,
  );
  return { ...settings, revision: settings.revision + 1 };
}

export async function resetSiteSettings() {
  await ensureSettingsRow();
  const current = await getFreshSiteSettings();
  await executeSettings(
    "UPDATE site_settings SET site_name = ?, ask_title = ?, primary_color = ?, favicon_key = NULL, favicon_type = NULL, logo_key = NULL, logo_type = NULL, brand_mode = ?, background_key = NULL, background_type = NULL, copyright_name = ?, top_bar_opacity = ?, navigation_opacity = ?, card_opacity = ?, background_opacity = ?, revision = revision + 1, updated_at = CURRENT_TIMESTAMP WHERE id = 1",
    [
      DEFAULT_SITE_SETTINGS.siteName,
      DEFAULT_SITE_SETTINGS.askTitle,
      DEFAULT_SITE_SETTINGS.primaryColor,
      DEFAULT_SITE_SETTINGS.brandMode,
      DEFAULT_SITE_SETTINGS.copyrightName,
      DEFAULT_SITE_SETTINGS.topBarOpacity,
      DEFAULT_SITE_SETTINGS.navigationOpacity,
      DEFAULT_SITE_SETTINGS.cardOpacity,
      DEFAULT_SITE_SETTINGS.backgroundOpacity,
    ],
  );
  return {
    ...normalizeSiteSettings(),
    revision: current.revision + 1,
  };
}
