"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PublicNavigation } from "@/components/Navigation";
import { useSite } from "@/components/SiteProvider";
import { siteAssetUrl } from "@/lib/site-settings-public";
import { usePublicView } from "@/lib/public-view";

const subscribeOrigin = () => () => {};

export function syncFavicon(faviconUrl: string) {
  if (typeof document === "undefined") return;
  const iconLinks = Array.from(document.head.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]'));
  if (!iconLinks.length) {
    const link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
    iconLinks.push(link);
  }
  for (const link of iconLinks) {
    link.href = faviconUrl;
    link.removeAttribute("type");
    link.removeAttribute("sizes");
  }
}

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const view = usePublicView();
  const { settings, algoliaConfig, adminAuthenticated } = useSite();
  const siteUrl = useSyncExternalStore(subscribeOrigin, () => window.location.origin, () => "当前站点");
  const adminArea = pathname === "/admin" || pathname.startsWith("/admin/");
  const faviconUrl = settings.faviconKey ? siteAssetUrl("favicon", settings.revision) : "/favicon.ico";

  useEffect(() => {
    syncFavicon(faviconUrl);
  }, [faviconUrl, pathname]);

  return (
    <>
      <title>{settings.siteName}</title>
      <Header
        admin={adminArea && adminAuthenticated}
        showSearch={pathname !== "/" || view === "display"}
        title={settings.siteName}
        faviconUrl={faviconUrl}
        logoUrl={settings.logoKey ? siteAssetUrl("logo", settings.revision) : "/logo.svg"}
        brandMode={settings.brandMode}
        algoliaConfig={algoliaConfig}
      />
      <PublicNavigation />
      <div key={pathname} className="page-content page-transition">{children}</div>
      <Footer copyrightName={settings.copyrightName} siteName={settings.siteName} siteUrl={siteUrl} />
    </>
  );
}
