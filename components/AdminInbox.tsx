"use client";

import { useEffect, useState, useRef } from "react";
import type { Question } from "@/lib/db";
import { MarkdownContent } from "@/components/MarkdownContent";

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
  const [batchBusy, setBatchBusy] = useState(false);
  const [answerBusyId, setAnswerBusyId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [operationMessage, setOperationMessage] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const confirmRef = useRef<HTMLElement>(null);
  const operationRef = useRef<HTMLElement>(null);

  useEffect(() => {
    import("@mdui/icons/check.js");
    import("@mdui/icons/delete.js");
    import("@mdui/icons/check-box.js");
  }, []);

  useEffect(() => {
    const el = operationRef.current;
    if (!el) return;
    const handler = () => setOperationMessage("");
    el.addEventListener("close", handler);
    return () => el.removeEventListener("close", handler);
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
      setSelected(new Set());
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function answer(id: string, form: HTMLFormElement) {
    setAnswerBusyId(id);
    const data = new FormData(form);
    try {
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
        setOperationMessage("回答已保存。");
        await load();
      } else {
        const result = (await response.json().catch(() => null)) as { error?: string } | null;
        setOperationMessage(result?.error ?? "回答保存失败，请稍后再试。");
      }
    } catch {
      setOperationMessage("网络错误，回答未保存。");
    } finally {
      setAnswerBusyId(null);
    }
  }

  async function deleteSelected() {
    if (!selected.size || !window.confirm(`确定要删除选中的 ${selected.size} 个问题吗？此操作不可撤销。`)) return;
    setBatchBusy(true);
    try {
      const responses = await Promise.all([...selected].map((id) => fetch(`/api/questions/${id}`, { method: "DELETE" })));
      if (responses.every((response) => response.ok)) {
        setOperationMessage(`已删除 ${selected.size} 个问题。`);
        await load();
      } else {
        setOperationMessage("部分问题删除失败，请刷新后重试。");
      }
    } catch {
      setOperationMessage("网络错误，批量删除未完成。");
    } finally {
      setBatchBusy(false);
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
      <mdui-card className="admin-tabs-card" variant="outlined">
        <div className="row">
          <mdui-tabs value={status} full-width style={{width:"100%"}}>
            {["pending","answered","published","all"].map((item) => (
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
      </mdui-card>

      {selected.size ? (
        <div className="admin-batch-bar" role="toolbar" aria-label="批量操作">
          <span>已选择 {selected.size} 个问题</span>
          <mdui-button variant="outlined" type="button" loading={batchBusy || undefined} onClick={() => void deleteSelected()}>
            <mdui-icon-delete slot="icon"></mdui-icon-delete>
            批量删除
          </mdui-button>
        </div>
      ) : null}

      {questions.map((question) => (
        <mdui-card className="admin-card" variant="elevated" key={question.id}>
          <details className="admin-question" open={expanded.has(question.id) || undefined} onToggle={(event) => {
            const next = new Set(expanded);
            if ((event.currentTarget as HTMLDetailsElement).open) next.add(question.id); else next.delete(question.id);
            setExpanded(next);
          }}>
            <summary className="admin-question-summary">
              <mdui-checkbox checked={selected.has(question.id) || undefined} aria-label={`选择来自 ${question.nickname || "匿名"} 的问题`} onClick={(event) => {
                event.stopPropagation();
                const next = new Set(selected);
                if (next.has(question.id)) next.delete(question.id); else next.add(question.id);
                setSelected(next);
              }}></mdui-checkbox>
              <span><strong>{question.nickname || "匿名"}</strong><span className="muted"> · {new Date(question.created_at?.replace(" ", "T") + "Z").toLocaleString()}</span></span>
            </summary>
            <div className="admin-question-content">
              <p><MarkdownContent text={question.content} /></p>
              {question.attachment_key ? <p><img src={`/api/questions/${question.id}/attachment`} alt="附件图片" className="admin-attachment" /></p> : null}
              {question.answer ? <p className="muted">已答：<MarkdownContent text={question.answer} /></p> : null}
              <form className="form-stack" onSubmit={(event) => { event.preventDefault(); void answer(question.id, event.currentTarget); }}>
                <mdui-text-field name="answer" label={question.answer ? "修改回答" : "回答"} variant="filled" rows="4" required value={question.answer ?? undefined} />
                <mdui-checkbox name="publish" checked={question.status === "published" || undefined}>发布到首页</mdui-checkbox>
                <div className="admin-question-actions">
                  <mdui-button type="submit" loading={answerBusyId === question.id || undefined}><mdui-icon-check slot="icon"></mdui-icon-check>保存回答</mdui-button>
                  <mdui-button type="button" onClick={() => setDeleteId(question.id)}><mdui-icon-delete slot="icon"></mdui-icon-delete>删除问题</mdui-button>
                </div>
              </form>
            </div>
          </details>
        </mdui-card>
      ))}

      {!questions.length && !busy ? <p className="muted">这里暂时没有问题。</p> : null}

      <mdui-dialog ref={confirmRef} open={deleteId !== null ? true : undefined} headline="确认删除">
        <p>确定要删除这个问题吗？关联的图片附件也将被清除，此操作不可撤销。</p>
        <mdui-button slot="action" variant="text" type="button" onClick={() => setDeleteId(null)}>取消</mdui-button>
        <mdui-button slot="action" type="button" onClick={doDelete}>确认删除</mdui-button>
      </mdui-dialog>

      <mdui-dialog ref={operationRef} open={operationMessage ? true : undefined} headline="操作结果">
        <p>{operationMessage}</p>
        <mdui-button slot="action" variant="text" type="button" onClick={() => setOperationMessage("")}>知道了</mdui-button>
      </mdui-dialog>
    </section>
  );
}
