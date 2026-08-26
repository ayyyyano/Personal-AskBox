"use client";
import { useState, useRef, useEffect } from "react";
import { TermsContent, PrivacyContent, LAST_UPDATED } from "@/components/Legal";

export function Footer({
  copyrightName = "Nekro",
  siteName = "个人提问箱",
  siteUrl = "当前站点",
}: { copyrightName?: string; siteName?: string; siteUrl?: string }) {
  const [termsOpen, setTermsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const termsRef = useRef<HTMLElement>(null);
  const privacyRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = termsRef.current;
    if (!el) return;
    const handler = () => setTermsOpen(false);
    el.addEventListener("close", handler);
    return () => el.removeEventListener("close", handler);
  }, []);

  useEffect(() => {
    const el = privacyRef.current;
    if (!el) return;
    const handler = () => setPrivacyOpen(false);
    el.addEventListener("close", handler);
    return () => el.removeEventListener("close", handler);
  }, []);

  return (
    <>
      <footer className="shell" style={{textAlign:"center",padding:"24px 0 32px",fontSize:"0.8rem",color:"rgb(var(--mdui-color-on-surface-variant))"}}>
        <mdui-button variant="text" type="button" onClick={() => setTermsOpen(true)}>用户协议</mdui-button>
        <mdui-button variant="text" type="button" onClick={() => setPrivacyOpen(true)}>隐私政策</mdui-button>
        <p style={{margin:"8px 0 0"}}>Copyright &copy; 2026 {copyrightName}</p>
      </footer>

      <mdui-dialog ref={termsRef} open={termsOpen || undefined} headline="用户协议">
        <div className="legal-dialog-content">
          <p style={{color:"rgb(var(--mdui-color-on-surface-variant))",fontSize:"0.875rem"}}>最后更新日期：{LAST_UPDATED}</p>
          <TermsContent siteName={siteName} siteUrl={siteUrl} />
        </div>
        <mdui-button slot="action" variant="text" type="button" onClick={() => setTermsOpen(false)}>关闭</mdui-button>
      </mdui-dialog>

      <mdui-dialog ref={privacyRef} open={privacyOpen || undefined} headline="隐私政策">
        <div className="legal-dialog-content">
          <p style={{color:"rgb(var(--mdui-color-on-surface-variant))",fontSize:"0.875rem"}}>最后更新日期：{LAST_UPDATED}</p>
          <PrivacyContent siteName={siteName} siteUrl={siteUrl} />
        </div>
        <mdui-button slot="action" variant="text" type="button" onClick={() => setPrivacyOpen(false)}>关闭</mdui-button>
      </mdui-dialog>
    </>
  );
}
