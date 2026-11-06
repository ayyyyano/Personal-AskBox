export const DEFAULT_SITE_SETTINGS = {
  siteName: "个人提问箱",
  askTitle: "有什么想问的吗？",
  primaryColor: "#DDAACC",
  faviconKey: null,
  faviconType: null,
  logoKey: null,
  logoType: null,
  brandMode: "logo",
  backgroundKey: null,
  backgroundType: null,
  copyrightName: "Nekro",
  topBarOpacity: 50,
  navigationOpacity: 50,
  cardOpacity: 50,
  backgroundOpacity: 50,
  revision: 0,
} as const;

export type BrandMode = "logo" | "avatar";

export type SiteSettings = {
  siteName: string;
  askTitle: string;
  primaryColor: string;
  faviconKey: string | null;
  faviconType: string | null;
  logoKey: string | null;
  logoType: string | null;
  brandMode: BrandMode;
  backgroundKey: string | null;
  backgroundType: string | null;
  copyrightName: string;
  topBarOpacity: number;
  navigationOpacity: number;
  cardOpacity: number;
  backgroundOpacity: number;
  revision: number;
};

export type SiteSettingsRow = {
  site_name: string | null;
  ask_title: string | null;
  primary_color: string | null;
  favicon_key: string | null;
  favicon_type: string | null;
  logo_key: string | null;
  logo_type: string | null;
  brand_mode: string | null;
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

function normalizeBrandMode(value: string | null | undefined): BrandMode {
  return value === "avatar" ? "avatar" : DEFAULT_SITE_SETTINGS.brandMode;
}

export function normalizeSiteSettings(row?: SiteSettingsRow | null): SiteSettings {
  return {
    siteName: normalizeText(row?.site_name, DEFAULT_SITE_SETTINGS.siteName),
    askTitle: normalizeText(row?.ask_title, DEFAULT_SITE_SETTINGS.askTitle),
    primaryColor: normalizeColor(row?.primary_color),
    faviconKey: row?.favicon_key ?? DEFAULT_SITE_SETTINGS.faviconKey,
    faviconType: row?.favicon_type ?? DEFAULT_SITE_SETTINGS.faviconType,
    logoKey: row?.logo_key ?? DEFAULT_SITE_SETTINGS.logoKey,
    logoType: row?.logo_type ?? DEFAULT_SITE_SETTINGS.logoType,
    brandMode: normalizeBrandMode(row?.brand_mode),
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

export function siteAssetUrl(kind: "favicon" | "logo" | "background", revision: number) {
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
