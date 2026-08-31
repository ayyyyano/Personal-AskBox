"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PublicNavigation } from "@/components/Navigation";
import type { AlgoliaConfig } from "@/lib/algolia-config";

type AppChromeProps = {
  children: React.ReactNode;
  siteName: string;
  faviconUrl: string;
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
  copyrightName,
  siteUrl,
  adminAuthenticated,
  algoliaConfig,
}: AppChromeProps) {
  const pathname = usePathname();
  const adminArea = isAdminPath(pathname);
  const [pageTransitionActive, setPageTransitionActive] = useState(false);

  useEffect(() => {
    syncFavicon(faviconUrl);
  }, [faviconUrl]);

  useEffect(() => {
    setPageTransitionActive(false);
    let enterFrame = 0;
    const resetFrame = window.requestAnimationFrame(() => {
      // Give the removed class a frame to commit before adding it again.
      // This keeps fast RSC navigations (such as ask <-> display) animated.
      enterFrame = window.requestAnimationFrame(() => setPageTransitionActive(true));
    });
    return () => {
      window.cancelAnimationFrame(resetFrame);
      window.cancelAnimationFrame(enterFrame);
    };
  }, [pathname]);

  return (
    <>
      <Header admin={adminArea && adminAuthenticated} showSearch={pathname !== "/ask"} title={siteName} faviconUrl={faviconUrl} algoliaConfig={algoliaConfig} />
      <PublicNavigation />
      <div className={`page-content${pageTransitionActive ? " page-transition" : ""}`}>{children}</div>
      <Footer copyrightName={copyrightName} siteName={siteName} siteUrl={siteUrl} />
    </>
  );
}
