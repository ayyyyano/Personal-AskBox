import { AskForm } from "@/components/AskForm";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PublishedList } from "@/components/PublishedList";
import { listPublishedQuestions } from "@/lib/db";
import { getEnv, siteName } from "@/lib/env";

export default async function HomePage() {
  const questions = await listPublishedQuestions().catch(() => []);
  const siteKey = getEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY");

  return (
    <>
      <Header />
      <main className="shell">
        <section className="hero">
          <div>
            <h1 className="headline">{siteName()}</h1>
            <p className="lede">
              匿名也可以认真提问。把想问的、想说的、想确认的事放进来，我会在后台挑选回答，公开内容只显示已经发布的问答。
            </p>
          </div>
          <mdui-card className="panel" variant="elevated">
            <AskForm siteKey={siteKey} />
          </mdui-card>
        </section>
        <PublishedList questions={questions} />
      </main>
      <Footer />
    </>
  );
}
