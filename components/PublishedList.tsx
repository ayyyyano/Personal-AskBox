"use client";
import { useEffect, useState, useRef } from "react";
import type { Question } from "@/lib/db";
import { TimeDisplay } from "@/components/TimeDisplay";

export function PublishedList({ questions }: { questions: Question[] }) {
  const [snackMessage, setSnackMessage] = useState("");
  const snackRef = useRef<HTMLElement>(null);

  useEffect(() => {
    import("@mdui/icons/alternate-email.js");
    import("@mdui/icons/access-time.js");
    import("@mdui/icons/question-mark.js");
    import("@mdui/icons/question-answer.js");
  }, []);

  useEffect(() => {
    if (!snackMessage) return;
    const el = snackRef.current;
    if (!el) return;
    (el as any).open = true;
  }, [snackMessage]);

  async function copyCard(question: Question) {
    const text = `Q: ${question.content}\nA: ${question.answer}`;
    await navigator.clipboard.writeText(text);
    setSnackMessage("已复制到剪贴板");
  }

  return (
    <section className="published" aria-label="公开问答">
      <h2>最近回答</h2>
      {questions.map((question) => (
        <mdui-card
          className="question-card"
          variant="elevated"
          clickable
          key={question.id}
          onClick={() => copyCard(question)}
        >
          <p><mdui-icon-question-mark style={{fontSize:18,verticalAlign:"middle"}}></mdui-icon-question-mark>{" "}{question.content}</p>
          {question.attachment_key ? <p><img src={`/api/questions/${question.id}/attachment`} alt="附件图片" style={{maxWidth:"100%",maxHeight:320,borderRadius:8,objectFit:"contain"}} /></p> : null}
          <mdui-divider />
          <p><mdui-icon-question-answer style={{fontSize:18,verticalAlign:"middle"}}></mdui-icon-question-answer>{" "}{question.answer}</p>
          <p className="muted">
            <mdui-icon-alternate-email style={{fontSize:16,verticalAlign:"middle"}}></mdui-icon-alternate-email>
            {" "}{question.nickname || "匿名"}{" · "}
            <mdui-icon-access-time style={{fontSize:16,verticalAlign:"middle"}}></mdui-icon-access-time>
            {" "}{question.published_at ? <TimeDisplay date={question.published_at} /> : ""}
          </p>
        </mdui-card>
      ))}
      {!questions.length ? <p className="muted">还没有公开回答。</p> : null}
      <mdui-snackbar ref={snackRef}>{snackMessage}</mdui-snackbar>
    </section>
  );
}
