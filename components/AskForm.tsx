"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        target: string | HTMLElement,
        options: { sitekey: string; callback: (token: string) => void }
      ) => void;
    };
  }
}

export function AskForm({ siteKey }: { siteKey: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [showTurnstile, setShowTurnstile] = useState(false);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    import("@mdui/icons/alternate-email.js");
    import("@mdui/icons/arrow-forward.js");
    import("@mdui/icons/attachment.js");
    import("@mdui/icons/location-searching.js");
  }, []);

  useEffect(() => {
    if (!siteKey || !showTurnstile) return;
    let cancelled = false;

    const renderTurnstile = () => {
      if (cancelled || !turnstileRef.current || !window.turnstile) return;
      window.turnstile.render(turnstileRef.current, {
        sitekey: siteKey,
        callback: setToken
      });
    };

    if (window.turnstile) {
      renderTurnstile();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = renderTurnstile;
    document.body.appendChild(script);
    return () => {
      cancelled = true;
      script.remove();
    };
  }, [showTurnstile, siteKey]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formEl = event.currentTarget;
    setBusy(true);
    setMessage("");
    const form = new FormData(formEl);
    form.set("turnstileToken", token);
    if (file) form.set("attachment", file);
    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        body: form
      });
      setBusy(false);
      if (response.ok) {
        formEl.reset();
        setFile(null);
        setShowTurnstile(false);
        setToken("");
        setMessage("已经投递到收件箱。");
        return;
      }
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setMessage(data?.error ?? "提交失败，请稍后再试。");
    } catch {
      setBusy(false);
      setMessage("网络错误，请稍后再试。");
    }
  }

  return (
    <form className="form-stack" onSubmit={submit}>
      <mdui-text-field name="nickname" label="昵称 (可选)" maxlength="40" variant="outlined" clearable>
        <mdui-icon-alternate-email slot="icon"></mdui-icon-alternate-email>
      </mdui-text-field>
      <mdui-text-field name="content" label="想问什么? (支持 Markdown)" variant="outlined" required rows="7" maxlength="1000" counter />
      <mdui-divider style={{opacity:0}}></mdui-divider>
      <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={e => setFile(e.target.files?.[0] ?? null)} hidden />
      <mdui-button variant="outlined" full-width onClick={() => fileInputRef.current?.click()}>
        <mdui-icon-attachment slot="icon"></mdui-icon-attachment>
        {file ? file.name : "图片附件 (可选)"}
      </mdui-button>
      {siteKey ? (
        showTurnstile ? (
          <div ref={turnstileRef} style={{display:"flex",justifyContent:"center"}} />
        ) : (
          <mdui-button variant="outlined" full-width onClick={() => setShowTurnstile(true)}>
            <mdui-icon-location-searching slot="icon"></mdui-icon-location-searching>
            完成人机验证
          </mdui-button>
        )
      ) : null}
      <mdui-button type="submit" loading={busy || undefined} full-width>
        <mdui-icon-arrow-forward slot="end-icon"></mdui-icon-arrow-forward>
        发送问题
      </mdui-button>
      {message ? <p style={{margin:0,padding:"8px 16px",borderRadius:8,color:"rgb(var(--mdui-color-on-surface-variant))"}}>{message}</p> : null}
    </form>
  );
}
