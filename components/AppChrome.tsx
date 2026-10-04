"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PublicNavigation } from "@/components/Navigation";
import type { AlgoliaConfig } from "@/lib/algolia-config";
import type { BrandMode } from "@/lib/site-settings";

type AppChromeProps = {
  children: React.ReactNode;
  siteName: string;
  faviconUrl: string;
  logoUrl: string;
  brandMode: BrandMode;
  copyrightName: string;
  siteUrl: string;
  adminAuthenticated: boolean;
  algoliaConfig: AlgoliaConfig;
};

function isAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function syncFavicon(faviconUrl: string) {
  if (typeof document === "undefined") return;

  const iconLinks = Array.from(document.head.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]'));
  for (const link of iconLinks) link.remove();

  const link = document.createElement("link");
  link.rel = "icon";
  link.href = faviconUrl;
  document.head.appendChild(link);
}

export function AppChrome({
  children,
  siteName,
  faviconUrl,
  logoUrl,
  brandMode,
  copyrightName,
  siteUrl,
  adminAuthenticated,
  algoliaConfig,
}: AppChromeProps) {
  const pathname = usePathname();
  const adminArea = isAdminPath(pathname);
  useEffect(() => {
    syncFavicon(faviconUrl);
  }, [faviconUrl]);

  return (
    <>
      <Header
        admin={adminArea && adminAuthenticated}
        showSearch={pathname !== "/ask"}
        title={siteName}
        faviconUrl={faviconUrl}
        logoUrl={logoUrl}
        brandMode={brandMode}
        algoliaConfig={algoliaConfig}
      />
      <PublicNavigation />
      <div key={pathname} className="page-content page-transition">{children}</div>
      <Footer copyrightName={copyrightName} siteName={siteName} siteUrl={siteUrl} />
    </>
  );
}
