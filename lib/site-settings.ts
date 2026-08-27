import { cache } from "react";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { getEnv } from "@/lib/env";

export const DEFAULT_SITE_SETTINGS = {
  siteName: "个人提问箱",
  askTitle: "有什么想问的吗？",
  displayTitle: "来看看回答吧。",
  adminLoginTitle: "别来无恙啊！",
  primaryColor: "#DDAACC",
  faviconKey: null,
  faviconType: null,
  backgroundKey: null,
  backgroundType: null,
  copyrightName: "Nekro",
  topBarOpacity: 92,
  navigationOpacity: 90,
  cardOpacity: 88,
  backgroundOpacity: 100,
  revision: 0,
} as const;

export type SiteSettings = {
  siteName: string;
  askTitle: string;
  displayTitle: string;
  adminLoginTitle: string;
  primaryColor: string;
  faviconKey: string | null;
  faviconType: string | null;
  backgroundKey: string | null;
  backgroundType: string | null;
  copyrightName: string;
  topBarOpacity: number;
  navigationOpacity: number;
  cardOpacity: number;
  backgroundOpacity: number;
  revision: number;
};

type SiteSettingsRow = {
  site_name: string | null;
  ask_title: string | null;
  display_title: string | null;
  admin_login_title: string | null;
  primary_color: string | null;
  favicon_key: string | null;
  favicon_type: string | null;
  background_key: string | null;
  background_type: string | null;
  copyright_name: string | null;
  top_bar_opacity: number | null;
  navigation_opacity: number | null;
  card_opacity: number | null;
  background_opacity: number | null;
  revision: number | null;
};

function normalizeColor(value: string | null | undefined) {
  return /^#[0-9a-f]{6}$/i.test(value ?? "") ? value!.toUpperCase() : DEFAULT_SITE_SETTINGS.primaryColor;
}

function normalizeText(value: string | null | undefined, fallback: string) {
  const text = value?.trim();
  return text || fallback;
}

function normalizeOpacity(value: number | null | undefined, fallback: number) {
  const opacity = Number(value);
  return Number.isFinite(opacity) ? Math.min(100, Math.max(0, Math.round(opacity))) : fallback;
}

export function normalizeSiteSettings(row?: SiteSettingsRow | null): SiteSettings {
  return {
    siteName: normalizeText(row?.site_name, DEFAULT_SITE_SETTINGS.siteName),
    askTitle: normalizeText(row?.ask_title, DEFAULT_SITE_SETTINGS.askTitle),
    displayTitle: normalizeText(row?.display_title, DEFAULT_SITE_SETTINGS.displayTitle),
    adminLoginTitle: normalizeText(row?.admin_login_title, DEFAULT_SITE_SETTINGS.adminLoginTitle),
    primaryColor: normalizeColor(row?.primary_color),
    faviconKey: row?.favicon_key ?? DEFAULT_SITE_SETTINGS.faviconKey,
    faviconType: row?.favicon_type ?? DEFAULT_SITE_SETTINGS.faviconType,
    backgroundKey: row?.background_key ?? DEFAULT_SITE_SETTINGS.backgroundKey,
    backgroundType: row?.background_type ?? DEFAULT_SITE_SETTINGS.backgroundType,
    copyrightName: normalizeText(row?.copyright_name, DEFAULT_SITE_SETTINGS.copyrightName),
    topBarOpacity: normalizeOpacity(row?.top_bar_opacity, DEFAULT_SITE_SETTINGS.topBarOpacity),
    navigationOpacity: normalizeOpacity(row?.navigation_opacity, DEFAULT_SITE_SETTINGS.navigationOpacity),
    cardOpacity: normalizeOpacity(row?.card_opacity, DEFAULT_SITE_SETTINGS.cardOpacity),
    backgroundOpacity: normalizeOpacity(row?.background_opacity, DEFAULT_SITE_SETTINGS.backgroundOpacity),
    revision: Math.max(0, Number(row?.revision ?? DEFAULT_SITE_SETTINGS.revision)),
  };
}

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
    settings.displayTitle,
    settings.adminLoginTitle,
    settings.primaryColor,
    settings.faviconKey,
    settings.faviconType,
    settings.backgroundKey,
    settings.backgroundType,
    settings.copyrightName,
    settings.topBarOpacity,
    settings.navigationOpacity,
    settings.cardOpacity,
    settings.backgroundOpacity,
  ];
  await executeSettings(
    "UPDATE site_settings SET site_name = ?, ask_title = ?, display_title = ?, admin_login_title = ?, primary_color = ?, favicon_key = ?, favicon_type = ?, background_key = ?, background_type = ?, copyright_name = ?, top_bar_opacity = ?, navigation_opacity = ?, card_opacity = ?, background_opacity = ?, revision = revision + 1, updated_at = CURRENT_TIMESTAMP WHERE id = 1",
    params,
  );
  return { ...settings, revision: settings.revision + 1 };
}

export async function resetSiteSettings() {
  await ensureSettingsRow();
  const current = await getFreshSiteSettings();
  await executeSettings(
    "UPDATE site_settings SET site_name = ?, ask_title = ?, display_title = ?, admin_login_title = ?, primary_color = ?, favicon_key = NULL, favicon_type = NULL, background_key = NULL, background_type = NULL, copyright_name = ?, top_bar_opacity = ?, navigation_opacity = ?, card_opacity = ?, background_opacity = ?, revision = revision + 1, updated_at = CURRENT_TIMESTAMP WHERE id = 1",
    [
      DEFAULT_SITE_SETTINGS.siteName,
      DEFAULT_SITE_SETTINGS.askTitle,
      DEFAULT_SITE_SETTINGS.displayTitle,
      DEFAULT_SITE_SETTINGS.adminLoginTitle,
      DEFAULT_SITE_SETTINGS.primaryColor,
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

export function siteAssetUrl(kind: "favicon" | "background", revision: number) {
  return `/api/site-assets/${kind}?v=${revision}`;
}

export function colorToRgb(color: string) {
  const value = color.slice(1);
  return [0, 2, 4].map((index) => Number.parseInt(value.slice(index, index + 2), 16)).join(", ");
}

export function mixColor(color: string, target: [number, number, number], amount: number) {
  const value = color.slice(1);
  const source = [0, 2, 4].map((index) => Number.parseInt(value.slice(index, index + 2), 16));
  return source.map((channel, index) => Math.round(channel * (1 - amount) + target[index] * amount)).join(", ");
}

export function colorContrastRgb(color: string) {
  const value = color.slice(1);
  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);
  return (red * 299 + green * 587 + blue * 114) / 1000 > 155 ? "0, 0, 0" : "255, 255, 255";
}

export function contrastForRgb(rgb: string) {
  const [red, green, blue] = rgb.split(",").map((channel) => Number(channel.trim()));
  return (red * 299 + green * 587 + blue * 114) / 1000 > 155 ? "0, 0, 0" : "255, 255, 255";
}
