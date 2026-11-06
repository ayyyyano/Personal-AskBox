"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { AskForm } from "@/components/AskForm";
import { useSite } from "@/components/SiteProvider";
import { usePublicView } from "@/lib/public-view";
import type { PublishedQuestion } from "@/lib/db";

const PublishedList = dynamic(() => import("@/components/PublishedList").then((module) => module.PublishedList));

export function PublicHome() {
  const view = usePublicView();
  const { settings, siteKey, ready, error: configError, retry } = useSite();
  const [questions, setQuestions] = useState<PublishedQuestion[] | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const pending = useRef<Promise<PublishedQuestion[]> | null>(null);

  useEffect(() => {
    if (view !== "display" || questions !== null) return;
    let active = true;
    if (!pending.current) {
      pending.current = fetch("/api/public/questions", { cache: "no-store" }).then(async (response) => {
        if (!response.ok) throw new Error("公开问答加载失败");
        const data = await response.json() as { questions: PublishedQuestion[] };
        return data.questions;
      });
    }
    const request = pending.current;
    void request.then((items) => {
      if (active) { setQuestions(items); setError(false); }
    }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [view, questions, attempt]);

  function retryQuestions() {
    pending.current = null;
    setError(false);
    setAttempt((value) => value + 1);
  }

  return (
    <main>
      <section hidden={view !== "ask"} className="shell page-main ask-page page-transition" aria-labelledby="ask-title">
        <mdui-card className="panel form-panel" variant="elevated">
          <h1 id="ask-title" className="form-panel-title">{settings.askTitle}</h1>
          {configError ? <p role="alert">站点配置加载失败。<button type="button" onClick={retry}>重试</button></p> : null}
          <AskForm siteKey={siteKey} disabled={!ready} />
        </mdui-card>
      </section>
      <section hidden={view !== "display"} className="shell page-main display-page page-transition" aria-label="公开问答">
        {questions !== null ? <PublishedList questions={questions} /> : error ? (
          <div role="alert"><p>公开问答加载失败，请稍后重试。</p><mdui-button type="button" variant="outlined" onClick={retryQuestions}>重新加载</mdui-button></div>
        ) : view === "display" ? <p role="status">正在加载公开问答…</p> : null}
      </section>
    </main>
  );
}
