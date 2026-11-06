"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { AlgoliaConfig } from "@/lib/algolia-config";
import { DEFAULT_SITE_SETTINGS, colorContrastRgb, colorToRgb, contrastForRgb, mixColor, siteAssetUrl, type SiteSettings } from "@/lib/site-settings-public";

export type PublicConfig = { settings: SiteSettings; siteKey: string; algoliaConfig: AlgoliaConfig };
const initialConfig: PublicConfig = {
  settings: { ...DEFAULT_SITE_SETTINGS },
  siteKey: "",
  algoliaConfig: { appId: "", searchOnlyApiKey: "", indexName: "" },
};
const settingsEvent = "askbox-settings-change";
let pendingConfig: Promise<PublicConfig> | undefined;

function loadConfig() {
  if (!pendingConfig) {
    pendingConfig = fetch("/api/public/config", { cache: "no-store" }).then(async (response) => {
      if (!response.ok) throw new Error("站点配置加载失败");
      return response.json() as Promise<PublicConfig>;
    }).finally(() => { pendingConfig = undefined; });
  }
  return pendingConfig;
}

export function publishSiteSettings(settings: SiteSettings) {
  window.dispatchEvent(new CustomEvent(settingsEvent, { detail: settings }));
}

function applyAppearance(settings: SiteSettings) {
  document.documentElement.toggleAttribute("data-askbox-background", Boolean(settings.backgroundKey));
  const lightContainer = mixColor(settings.primaryColor, [255, 255, 255], 0.8);
  const darkContainer = mixColor(settings.primaryColor, [0, 0, 0], 0.55);
  const variables: Record<string, string> = {
    "--askbox-primary-light-rgb": colorToRgb(settings.primaryColor),
    "--askbox-primary-dark-rgb": colorToRgb(settings.primaryColor),
    "--askbox-on-primary-light-rgb": colorContrastRgb(settings.primaryColor),
    "--askbox-on-primary-dark-rgb": colorContrastRgb(settings.primaryColor),
    "--askbox-primary-container-light-rgb": lightContainer,
    "--askbox-primary-container-dark-rgb": darkContainer,
    "--askbox-on-primary-container-light-rgb": contrastForRgb(lightContainer),
    "--askbox-on-primary-container-dark-rgb": contrastForRgb(darkContainer),
    "--mdui-color-secondary-light": colorToRgb(settings.primaryColor),
    "--mdui-color-secondary-dark": colorToRgb(settings.primaryColor),
    "--mdui-color-secondary-container-light": lightContainer,
    "--mdui-color-secondary-container-dark": darkContainer,
    "--mdui-color-on-secondary-container-light": contrastForRgb(lightContainer),
    "--mdui-color-on-secondary-container-dark": contrastForRgb(darkContainer),
    "--askbox-topbar-opacity": String(settings.topBarOpacity / 100),
    "--askbox-navigation-opacity": String(settings.navigationOpacity / 100),
    "--askbox-card-opacity": String(settings.cardOpacity / 100),
    "--askbox-background-opacity": String(settings.backgroundOpacity / 100),
    "--askbox-background-image": settings.backgroundKey ? `url("${siteAssetUrl("background", settings.revision)}")` : "none",
  };
  for (const [name, value] of Object.entries(variables)) document.documentElement.style.setProperty(name, value);
}

const SiteContext = createContext({
  ...initialConfig,
  ready: false,
  error: false,
  retry: () => {},
  adminAuthenticated: false,
  setAdminAuthenticated: (() => {}) as (authenticated: boolean) => void,
});

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState(initialConfig);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  useEffect(() => {
    let active = true;
    void loadConfig().then((next) => {
      if (!active) return;
      setConfig(next);
      setReady(true);
      setError(false);
    }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [attempt]);

  useEffect(() => {
    const update = (event: Event) => {
      const settings = (event as CustomEvent<SiteSettings>).detail;
      setConfig((current) => ({ ...current, settings }));
    };
    window.addEventListener(settingsEvent, update);
    return () => window.removeEventListener(settingsEvent, update);
  }, []);

  useEffect(() => { applyAppearance(config.settings); }, [config.settings]);

  return <SiteContext.Provider value={{ ...config, ready, error, retry, adminAuthenticated, setAdminAuthenticated }}>{children}</SiteContext.Provider>;
}

export function useSite() { return useContext(SiteContext); }

export function AdminSession({ authenticated }: { authenticated: boolean }) {
  const { setAdminAuthenticated } = useSite();
  useEffect(() => {
    setAdminAuthenticated(authenticated);
    return () => setAdminAuthenticated(false);
  }, [authenticated, setAdminAuthenticated]);
  return null;
}
