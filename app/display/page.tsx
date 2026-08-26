import { PublishedList } from "@/components/PublishedList";
import { listPublishedQuestions } from "@/lib/db";
import { getSiteSettings } from "@/lib/site-settings";

export default async function DisplayPage() {
  const questions = await listPublishedQuestions().catch(() => []);
  const settings = await getSiteSettings();

  return (
    <main className="shell page-main">
      <section className="page-intro">
        <p className="eyebrow">公开展示</p>
        <h1 className="page-title">{settings.displayTitle}</h1>
        <p className="lede">这里展示已经回答并公开的问题。</p>
      </section>
      <PublishedList questions={questions} />
    </main>
  );
}