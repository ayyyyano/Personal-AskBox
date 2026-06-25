import { AskForm } from "@/components/AskForm";
import { Header } from "@/components/Header";
import { listPublishedQuestions } from "@/lib/db";
import { getEnv, siteName } from "@/lib/env";

export const runtime = "edge";

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
          <aside className="panel">
            <AskForm siteKey={siteKey} />
          </aside>
        </section>

        <section className="published" aria-label="公开问答">
          <h2>最近回答</h2>
          {questions.map((question) => (
            <article className="question-card" key={question.id}>
              <p>{question.content}</p>
              <mdui-divider />
              <p>{question.answer}</p>
              <p className="muted">{question.nickname || "匿名"} · {question.published_at}</p>
            </article>
          ))}
          {!questions.length ? <p className="muted">还没有公开回答。</p> : null}
        </section>
      </main>
    </>
  );
}
