import { TermsContent, LAST_UPDATED } from "@/components/Legal";
import { getSiteSettings } from "@/lib/site-settings";
import { getSiteUrl } from "@/lib/site-url";

export default async function TermsPage() {
  const [settings, siteUrl] = await Promise.all([getSiteSettings(), getSiteUrl()]);

  return (
    <main className="shell legal-page">
      <h1>用户协议</h1>
      <p className="muted">最后更新日期：{LAST_UPDATED}</p>
      <TermsContent siteName={settings.siteName} siteUrl={siteUrl} />
    </main>
  );
}
