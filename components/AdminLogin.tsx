"use client";
import { useEffect, useState } from "react";

export function AdminLogin() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    import("@mdui/icons/account-circle.js");
    import("@mdui/icons/lock.js");
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/login", {
      method: "POST",
      body: form
    });
    if (response.ok) {
      window.location.href = "/admin";
      return;
    }
    const data = await response.json().catch(() => null) as { error?: string } | null;
    setBusy(false);
    setError(data?.error ?? "密码错误");
  }

  return (
    <mdui-card className="panel" variant="elevated">
    <form className="form-stack" onSubmit={submit}>
      <mdui-text-field disabled label="账号" value="Admin">
        <mdui-icon-account-circle slot="icon"></mdui-icon-account-circle>
      </mdui-text-field>
      <mdui-text-field name="password" type="password" label="密码" required toggle-password>
        <mdui-icon-lock slot="icon"></mdui-icon-lock>
      </mdui-text-field>
      <mdui-button type="submit" loading={busy || undefined}>
        {busy ? "登录中…" : "登录"}
      </mdui-button>
      {error ? <p style={{color:"rgb(var(--mdui-color-error,179,38,30))",margin:0}}>{error}</p> : null}
    </form>
    </mdui-card>
  );
}
