import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PublicNavigation } from "@/components/Navigation";
import { getSiteSettings, siteAssetUrl } from "@/lib/site-settings";
import { getSiteUrl } from "@/lib/site-url";

export async function PublicShell({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const faviconUrl = settings.faviconKey ? siteAssetUrl("favicon", settings.revision) : "/favicon.ico";
  const siteUrl = await getSiteUrl();

  return (
    <>
      <Header title={settings.siteName} faviconUrl={faviconUrl} />
      <PublicNavigation />
      <div className="page-content">{children}</div>
      <Footer copyrightName={settings.copyrightName} siteName={settings.siteName} siteUrl={siteUrl} />
    </>
  );
}
