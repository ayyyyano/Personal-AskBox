import { Header } from "@/components/Header";
import { isAdmin } from "@/lib/auth";
import { PublicNavigation } from "@/components/Navigation";
import { getSiteSettings, siteAssetUrl } from "@/lib/site-settings";

export async function AdminShell({ children }: { children: React.ReactNode }) {
  const authenticated = await isAdmin();
  const settings = await getSiteSettings();
  const faviconUrl = settings.faviconKey ? siteAssetUrl("favicon", settings.revision) : "/favicon.ico";
  const logoUrl = settings.logoKey ? siteAssetUrl("logo", settings.revision) : "/logo.svg";

  return (
    <>
      <Header admin={authenticated} title={settings.siteName} faviconUrl={faviconUrl} logoUrl={logoUrl} brandMode={settings.brandMode} />
      <PublicNavigation />
      <div className="page-content">{children}</div>
    </>
  );
}
