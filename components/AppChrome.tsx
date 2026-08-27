"use client";

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

  return (
    <>
      <Header admin={adminArea && adminAuthenticated} title={siteName} faviconUrl={faviconUrl} algoliaConfig={algoliaConfig} />
      <PublicNavigation />
      <div key={pathname} className="page-content page-transition">{children}</div>
      {!adminArea ? <Footer copyrightName={copyrightName} siteName={siteName} siteUrl={siteUrl} /> : null}
    </>
  );
}
