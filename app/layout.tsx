import type { Metadata } from "next";
import type { CSSProperties } from "react";
import "./globals.css";
import { AppChrome } from "@/components/AppChrome";
import { MduiBoot } from "@/components/MduiBoot";
import { isAdmin } from "@/lib/auth";
import { colorContrastRgb, colorToRgb, contrastForRgb, getSiteSettings, mixColor, siteAssetUrl } from "@/lib/site-settings";
import { getSiteUrl } from "@/lib/site-url";
import { getPublicAlgoliaConfig } from "@/lib/algolia-config";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: settings.siteName,
    description: "一个基于 Next.js、MDUI 2 和 Cloudflare 的个人匿名提问箱",
    icons: {
      icon: settings.faviconKey ? siteAssetUrl("favicon", settings.revision) : "/favicon.ico",
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, siteUrl, adminAuthenticated, algoliaConfig] = await Promise.all([
    getSiteSettings(),
    getSiteUrl(),
    isAdmin(),
    getPublicAlgoliaConfig(),
  ]);
  const rootStyle = {
    "--askbox-primary-light-rgb": colorToRgb(settings.primaryColor),
    "--askbox-primary-dark-rgb": colorToRgb(settings.primaryColor),
    "--askbox-on-primary-light-rgb": colorContrastRgb(settings.primaryColor),
    "--askbox-on-primary-dark-rgb": colorContrastRgb(settings.primaryColor),
    "--askbox-primary-container-light-rgb": mixColor(settings.primaryColor, [255, 255, 255], 0.8),
    "--askbox-primary-container-dark-rgb": mixColor(settings.primaryColor, [0, 0, 0], 0.55),
    "--askbox-on-primary-container-light-rgb": contrastForRgb(mixColor(settings.primaryColor, [255, 255, 255], 0.8)),
    "--askbox-on-primary-container-dark-rgb": contrastForRgb(mixColor(settings.primaryColor, [0, 0, 0], 0.55)),
    "--mdui-color-secondary-light": colorToRgb(settings.primaryColor),
    "--mdui-color-secondary-dark": colorToRgb(settings.primaryColor),
    "--mdui-color-secondary-container-light": mixColor(settings.primaryColor, [255, 255, 255], 0.8),
    "--mdui-color-secondary-container-dark": mixColor(settings.primaryColor, [0, 0, 0], 0.55),
    "--mdui-color-on-secondary-container-light": contrastForRgb(mixColor(settings.primaryColor, [255, 255, 255], 0.8)),
    "--mdui-color-on-secondary-container-dark": contrastForRgb(mixColor(settings.primaryColor, [0, 0, 0], 0.55)),
    "--askbox-topbar-opacity": String(settings.topBarOpacity / 100),
    "--askbox-navigation-opacity": String(settings.navigationOpacity / 100),
    "--askbox-card-opacity": String(settings.cardOpacity / 100),
    "--askbox-background-image": settings.backgroundKey
      ? `url("${siteAssetUrl("background", settings.revision)}")`
      : "none",
  } as CSSProperties;

  return (
    <html lang="zh-CN" className="mdui-theme-auto" style={rootStyle}>
      <body>
        <MduiBoot />
        <AppChrome
          siteName={settings.siteName}
          faviconUrl={settings.faviconKey ? siteAssetUrl("favicon", settings.revision) : "/favicon.ico"}
          copyrightName={settings.copyrightName}
          siteUrl={siteUrl}
          adminAuthenticated={adminAuthenticated}
          algoliaConfig={algoliaConfig}
        >
          {children}
        </AppChrome>
      </body>
    </html>
  );
}
