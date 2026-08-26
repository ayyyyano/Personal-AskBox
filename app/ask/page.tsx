import { AskForm } from "@/components/AskForm";
import { getEnv } from "@/lib/env";
import { getSiteSettings } from "@/lib/site-settings";

export default async function AskPage() {
  const siteKey = getEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY");
  const settings = await getSiteSettings();

  return (
    <main className="shell page-main split-page">
      <section className="page-intro">
        <p className="eyebrow">匿名提问</p>
        <h1 className="page-title">{settings.askTitle}</h1>
        <p className="lede">
          请在此写下你的问题。
        </p>
      </section>
      <mdui-card className="panel form-panel" variant="elevated">
        <AskForm siteKey={siteKey} />
      </mdui-card>
    </main>
  );
}