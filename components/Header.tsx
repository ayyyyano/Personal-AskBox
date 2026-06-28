"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { searchQuestions, type SearchResult } from "@/lib/algolia";
import { siteName } from "@/lib/env";
import Link from "next/link";

type Theme = "auto" | "light" | "dark";

const THEME_KEY = "mdui-theme";

const nextTheme: Record<Theme, Theme> = {
  auto: "light",
  light: "dark",
  dark: "auto",
};

const themeLabel: Record<Theme, string> = {
  auto: "跟随系统",
  light: "浅色模式",
  dark: "深色模式",
};

export function Header({ admin = false }: { admin?: boolean }) {
  const [theme, setTheme] = useState<Theme>("auto");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchBusy, setSearchBusy] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);
  const searchFieldRef = useRef<HTMLElement>(null);

  useEffect(() => {
    import("@mdui/icons/admin-panel-settings.js");
    import("@mdui/icons/light-mode.js");
    import("@mdui/icons/dark-mode.js");
    import("@mdui/icons/auto-mode.js");
    import("@mdui/icons/logout.js");
    import("@mdui/icons/search.js");

    const saved = localStorage.getItem(THEME_KEY) as Theme | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.className = `mdui-theme-${saved}`;
    }
  }, []);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handler = () => setSearchOpen(false);
    el.addEventListener("close", handler);
    return () => el.removeEventListener("close", handler);
  }, []);

  useEffect(() => {
    const el = searchFieldRef.current;
    if (!el) return;
    const handler = (e: Event) => setSearchQuery((e.target as any)?.value ?? "");
    el.addEventListener("input", handler);
    return () => el.removeEventListener("input", handler);
  }, []);

  const toggleTheme = () => {
    const next = nextTheme[theme];
    setTheme(next);
    document.documentElement.className = `mdui-theme-${next}`;
    localStorage.setItem(THEME_KEY, next);
  };

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setSearchResults([]); return; }
    setSearchBusy(true);
    try { const { hits } = await searchQuestions(q, admin ? undefined : "status:published"); setSearchResults(hits); } catch {}
    setSearchBusy(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => doSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery, doSearch]);

  const openSearch = () => { setSearchOpen(true); setSearchQuery(""); setSearchResults([]); };

  return (
    <header className="shell topbar">
      <Link href="/" className="brand">
        <span className="brand-mark">
          <img src="/favicon.ico" alt="logo" style={{width:40,height:40}} />
        </span>
        <span>{siteName()}</span>
      </Link>
      <div style={{display:"flex",gap:4,alignItems:"center"}}>
        <Link href="https://github.com/ayyyyano/Personal-AskBox" target="_blank" rel="noreferrer noopener" style={{display:"flex"}}>
          <mdui-button-icon aria-label="GitHub 项目主页">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 36 36" fill="currentColor">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M18,1.4C9,1.4,1.7,8.7,1.7,17.7c0,7.2,4.7,13.3,11.1,15.5c0.8,0.1,1.1-0.4,1.1-0.8c0-0.4,0-1.4,0-2.8c-4.5,1-5.5-2.2-5.5-2.2c-0.7-1.9-1.8-2.4-1.8-2.4c-1.5-1,0.1-1,0.1-1c1.6,0.1,2.5,1.7,2.5,1.7c1.5,2.5,3.8,1.8,4.7,1.4c0.1-1.1,0.6-1.8,1-2.2c-3.6-0.4-7.4-1.8-7.4-8.1c0-1.8,0.6-3.2,1.7-4.4c-0.2-0.4-0.7-2.1,0.2-4.3c0,0,1.4-0.4,4.5,1.7c1.3-0.4,2.7-0.5,4.1-0.5c1.4,0,2.8,0.2,4.1,0.5c3.1-2.1,4.5-1.7,4.5-1.7c0.9,2.2,0.3,3.9,0.2,4.3c1,1.1,1.7,2.6,1.7,4.4c0,6.3-3.8,7.6-7.4,8c0.6,0.5,1.1,1.5,1.1,3c0,2.2,0,3.9,0,4.5c0,0.4,0.3,0.9,1.1,0.8c6.5-2.2,11.1-8.3,11.1-15.5C34.3,8.7,27,1.4,18,1.4z"/>
            </svg>
          </mdui-button-icon>
        </Link>
        <mdui-button-icon aria-label="搜索问题" onClick={openSearch}>
          <mdui-icon-search></mdui-icon-search>
        </mdui-button-icon>
        <mdui-button-icon aria-label={themeLabel[theme]} onClick={toggleTheme}>
          {theme === "auto" && <mdui-icon-light-mode></mdui-icon-light-mode>}
          {theme === "light" && <mdui-icon-dark-mode></mdui-icon-dark-mode>}
          {theme === "dark" && <mdui-icon-auto-mode></mdui-icon-auto-mode>}
        </mdui-button-icon>
        {admin ? (
          <form action="/api/admin/logout" method="post" style={{display:"flex"}}>
            <mdui-button-icon aria-label="退出登录" type="submit">
              <mdui-icon-logout></mdui-icon-logout>
            </mdui-button-icon>
          </form>
        ) : (
          <Link href="/admin" style={{display:"flex"}}>
            <mdui-button-icon aria-label="管理后台">
              <mdui-icon-admin-panel-settings></mdui-icon-admin-panel-settings>
            </mdui-button-icon>
          </Link>
        )}
      </div>

      <mdui-dialog ref={dialogRef} open={searchOpen || undefined} headline="搜索问题">
        <mdui-text-field ref={searchFieldRef} value={searchQuery} placeholder="输入关键词…" variant="outlined" clearable helper="由 Algolia 提供搜索" autofocus>
          <mdui-icon-search slot="icon"></mdui-icon-search>
        </mdui-text-field>
        {searchBusy ? (
          <div style={{display:"flex",justifyContent:"center",padding:16}}><mdui-circular-progress /></div>
        ) : searchResults.length > 0 ? (
          <div style={{maxHeight:"50vh",overflowY:"auto"}}>
            {searchResults.map(r => (
              <div key={r.id} style={{padding:"10px 0",borderBottom:"1px solid rgb(var(--mdui-color-outline-variant))"}}>
                <p style={{margin:"0 0 4px",fontWeight:500}}>{r.content}</p>
                {r.answer ? <p style={{margin:"0 0 4px",fontSize:"0.875rem",color:"rgb(var(--mdui-color-on-surface-variant))"}}>{r.answer}</p> : null}
                <span style={{fontSize:"0.75rem",color:"rgb(var(--mdui-color-on-surface-variant))"}}>
                  {r.nickname || "匿名"} · {r.status === "published" ? (r.published_at ? new Date(r.published_at.replace(" ","T")+"Z").toLocaleDateString() : "") : r.status}
                </span>
              </div>
            ))}
          </div>
        ) : searchQuery.trim() ? (
          <p className="muted">没有找到相关问题。</p>
        ) : null}
        <mdui-button slot="action" type="button" onClick={() => setSearchOpen(false)}>关闭</mdui-button>
      </mdui-dialog>
    </header>
  );
}
