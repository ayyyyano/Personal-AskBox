"use client";

import { useEffect, useState, useRef } from "react";
import type { Question } from "@/lib/db";

const filterLabels: Record<string, string> = {
  pending: "待回答",
  answered: "已回答",
  published: "已展示",
  all: "全部问题",
};

export function AdminInbox() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [status, setStatus] = useState("pending");
  const [busy, setBusy] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const confirmRef = useRef<HTMLElement>(null);

  useEffect(() => {
    import("@mdui/icons/check.js");
    import("@mdui/icons/delete.js");
  }, []);

  useEffect(() => {
    const el = confirmRef.current;
    if (!el) return;
    const handler = () => setDeleteId(null);
    el.addEventListener("close", handler);
    return () => el.removeEventListener("close", handler);
  }, []);

  async function load(nextStatus = status) {
    setBusy(true);
    const response = await fetch(`/api/questions?status=${nextStatus}`, { cache: "no-store" });
    setBusy(false);
    if (response.ok) {
      const data = (await response.json()) as { questions: Question[] };
      setQuestions(data.questions);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function answer(id: string, form: HTMLFormElement) {
    const data = new FormData(form);
    const response = await fetch(`/api/questions/${id}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answer: data.get("answer"),
        publish: data.get("publish") === "on"
      })
    });
    if (response.ok) {
      form.reset();
      await load();
    }
  }

  async function doDelete() {
    if (!deleteId) return;
    setDeleteId(null);
    const response = await fetch(`/api/questions/${deleteId}`, { method: "DELETE" });
    if (response.ok) await load();
  }

  return (
    <section className="admin-layout">
      <div className="row">
        <mdui-tabs value={status} full-width style={{width:"100%"}}>
          {(["pending","answered","published","all"] as const).map((item) => (
            <mdui-tab
              key={item}
              value={item}
              onClick={() => {
                setStatus(item);
                load(item);
              }}
            >
              {filterLabels[item]}
            </mdui-tab>
          ))}
        </mdui-tabs>
        {busy ? <mdui-circular-progress /> : null}
      </div>

      {questions.map((question) => (
        <mdui-card className="admin-card" variant="elevated" key={question.id}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <strong>{question.nickname || "匿名"}</strong>
            <span className="muted">{new Date(question.created_at?.replace(" ", "T") + "Z").toLocaleString()}</span>
          </div>
          <p>{question.content}</p>
          {question.attachment_key ? <p><img src={`/api/questions/${question.id}/attachment`} alt="附件图片" style={{maxWidth:"100%",maxHeight:320,borderRadius:8,objectFit:"contain"}} /></p> : null}
          {question.answer ? <p className="muted">已答：{question.answer}</p> : null}
          <form
            className="form-stack"
            onSubmit={(event) => {
              event.preventDefault();
              answer(question.id, event.currentTarget);
            }}
          >
            <mdui-text-field name="answer" label="回答" variant="outlined" rows="4" required />
            <mdui-checkbox name="publish" checked>发布到首页</mdui-checkbox>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <mdui-button type="submit"><mdui-icon-check slot="icon"></mdui-icon-check>保存回答</mdui-button>
              <mdui-button type="button" onClick={() => setDeleteId(question.id)}><mdui-icon-delete slot="icon"></mdui-icon-delete>删除问题</mdui-button>
            </div>
          </form>
        </mdui-card>
      ))}

      {!questions.length && !busy ? <p className="muted">这里暂时没有问题。</p> : null}

      <mdui-dialog ref={confirmRef} open={deleteId !== null ? true : undefined} headline="确认删除">
        <p>确定要删除这个问题吗？关联的图片附件也将被清除，此操作不可撤销。</p>
        <mdui-button slot="action" variant="text" type="button" onClick={() => setDeleteId(null)}>取消</mdui-button>
        <mdui-button slot="action" type="button" onClick={doDelete}>确认删除</mdui-button>
      </mdui-dialog>
    </section>
  );
}
