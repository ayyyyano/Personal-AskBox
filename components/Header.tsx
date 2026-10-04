"use client";
import { useEffect, useState, useCallback, useRef, useSyncExternalStore } from "react";
import Image from "next/image";
import { searchQuestions, type SearchResult } from "@/lib/algolia";
import { MarkdownContent } from "@/components/MarkdownContent";
import type { AlgoliaConfig } from "@/lib/algolia-config";
import type { BrandMode } from "@/lib/site-settings";
import Link from "next/link";

type Theme = "auto" | "light" | "dark";
type MduiInputEvent = Event & { target: (EventTarget & { value?: string }) | null };

const THEME_KEY = "mdui-theme";
const THEME_EVENT = "askbox-theme-change";

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

function isTheme(value: string | null): value is Theme {
  return value === "auto" || value === "light" || value === "dark";
}

function getThemeSnapshot(): Theme {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    return isTheme(saved) ? saved : "auto";
  } catch {
    return "auto";
  }
}

function subscribeTheme(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(THEME_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(THEME_EVENT, onStoreChange);
  };
}

function formatSearchTime(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value.replace(" ", "T") + "Z");
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

type HeaderProps = {
  admin?: boolean;
  showSearch?: boolean;
  title?: string;
  faviconUrl?: string;
  logoUrl?: string;
  brandMode?: BrandMode;
  algoliaConfig?: AlgoliaConfig;
};

export function Header({
  admin = false,
  showSearch = true,
  title = "个人提问箱",
  faviconUrl = "/favicon.ico",
  logoUrl = "/logo.svg",
  brandMode = "logo",
  algoliaConfig,
}: HeaderProps) {
  const theme = useSyncExternalStore<Theme>(subscribeTheme, getThemeSnapshot, () => "auto");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchBusy, setSearchBusy] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);
  const searchFieldRef = useRef<HTMLElement>(null);
  const searchRequestRef = useRef(0);

  useEffect(() => {
    import("@mdui/icons/light-mode.js");
    import("@mdui/icons/dark-mode.js");
    import("@mdui/icons/auto-mode.js");
    import("@mdui/icons/search.js");
    import("@mdui/icons/question-mark.js");
    import("@mdui/icons/question-answer.js");
    if (admin) import("@mdui/icons/logout.js");

  }, [admin]);

  useEffect(() => {
    document.documentElement.className = `mdui-theme-${theme}`;
  }, [theme]);

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
    const handler = (e: Event) => {
      const value = (e as MduiInputEvent).target?.value ?? "";
      searchRequestRef.current += 1;
      setSearchQuery(value);
      if (!value.trim()) {
        setSearchResults([]);
        setSearchBusy(false);
        setSearchError(false);
      }
    };
    el.addEventListener("input", handler);
    return () => el.removeEventListener("input", handler);
  }, []);

  const toggleTheme = () => {
    const next = nextTheme[theme];
    document.documentElement.className = `mdui-theme-${next}`;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // The visual theme still changes when storage is unavailable.
    }
    window.dispatchEvent(new Event(THEME_EVENT));
  };

  const doSearch = useCallback(async (q: string) => {
    const requestId = ++searchRequestRef.current;
    if (!q.trim()) {
      setSearchResults([]);
      setSearchBusy(false);
      setSearchError(false);
      return;
    }
    setSearchBusy(true);
    setSearchError(false);
    try {
      const { hits } = await searchQuestions(q, admin ? undefined : "status:published", algoliaConfig);
      if (requestId !== searchRequestRef.current) return;
      setSearchResults(hits);
    } catch (error) {
      if (requestId !== searchRequestRef.current) return;
      console.error("Search failed:", error);
      setSearchResults([]);
      setSearchError(true);
    }
    finally {
      if (requestId === searchRequestRef.current) setSearchBusy(false);
    }
  }, [admin, algoliaConfig]);

  useEffect(() => {
    const t = setTimeout(() => doSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery, doSearch]);

  const openSearch = () => {
    searchRequestRef.current += 1;
    setSearchOpen(true);
    setSearchQuery("");
    setSearchResults([]);
    setSearchBusy(false);
    setSearchError(false);
  };

  return (
    <>
      <mdui-top-app-bar className="app-bar">
      <div className="shell topbar-inner">
        <Link href={admin ? "/admin" : "/ask"} className={`brand brand--${brandMode}`} aria-label={`${title}首页`}>
          {brandMode === "logo" ? (
            <span className="brand-logo">
              <Image src={logoUrl} alt={title} fill sizes="(max-width: 768px) 120px, 180px" unoptimized />
            </span>
          ) : (
            <>
              <span className="brand-mark">
                <Image src={faviconUrl} alt="" fill sizes="40px" unoptimized />
              </span>
              <span className="brand-title">{title}</span>
            </>
          )}
        </Link>
        <div className="topbar-actions">
          {admin ? (
            <form action="/api/admin/logout" method="post" className="icon-link">
              <mdui-button-icon aria-label="退出登录" type="submit">
                <mdui-icon-logout></mdui-icon-logout>
              </mdui-button-icon>
            </form>
          ) : (
            <Link href="https://github.com/ayyyyano/Personal-AskBox" target="_blank" rel="noreferrer noopener" className="icon-link">
              <mdui-button-icon aria-label="GitHub 项目主页">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 36 36" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M18,1.4C9,1.4,1.7,8.7,1.7,17.7c0,7.2,4.7,13.3,11.1,15.5c0.8,0.1,1.1-0.4,1.1-0.8c0-0.4,0-1.4,0-2.8c-4.5,1-5.5-2.2-5.5-2.2c-0.7-1.9-1.8-2.4-1.8-2.4c-1.5-1,0.1-1,0.1-1c1.6,0.1,2.5,1.7,2.5,1.7c1.5,2.5,3.8,1.8,4.7,1.4c0.1-1.1,0.6-1.8,1-2.2c-3.6-0.4-7.4-1.8-7.4-8.1c0-1.8,0.6-3.2,1.7-4.4c-0.2-0.4-0.7-2.1,0.2-4.3c0,0,1.4-0.4,4.5,1.7c1.3-0.4,2.7-0.5,4.1-0.5c1.4,0,2.8,0.2,4.1,0.5c3.1-2.1,4.5-1.7,4.5-1.7c0.9,2.2,0.3,3.9,0.2,4.3c1,1.1,1.7,2.6,1.7,4.4c0,6.3-3.8,7.6-7.4,8c0.6,0.5,1.1,1.5,1.1,3c0,2.2,0,3.9,0,4.5c0,0.4,0.3,0.9,1.1,0.8c6.5-2.2,11.1-8.3,11.1-15.5C34.3,8.7,27,1.4,18,1.4z"/>
                </svg>
              </mdui-button-icon>
            </Link>
          )}
            {showSearch ? (
              <mdui-button-icon aria-label="搜索问题" onClick={openSearch}>
                <mdui-icon-search></mdui-icon-search>
              </mdui-button-icon>
            ) : null}
          <mdui-button-icon aria-label={themeLabel[theme]} onClick={toggleTheme}>
            {theme === "auto" && <mdui-icon-light-mode></mdui-icon-light-mode>}
            {theme === "light" && <mdui-icon-dark-mode></mdui-icon-dark-mode>}
            {theme === "dark" && <mdui-icon-auto-mode></mdui-icon-auto-mode>}
          </mdui-button-icon>
        </div>
      </div>

      </mdui-top-app-bar>

      <mdui-dialog className="search-dialog" ref={dialogRef} open={searchOpen || undefined} headline="搜索问题">
        <div className="search-field-wrap">
          <mdui-text-field ref={searchFieldRef} value={searchQuery} placeholder="输入关键词…" variant="filled" clearable helper="由 Algolia 提供搜索" autofocus>
            <mdui-icon-search slot="icon"></mdui-icon-search>
          </mdui-text-field>
        </div>
        {searchBusy ? (
          <div style={{display:"flex",justifyContent:"center",padding:16}}><mdui-circular-progress /></div>
        ) : searchError ? (
          <div className="search-empty-state">
            <p>搜索服务暂时不可用，请稍后重试。</p>
            <mdui-button type="button" variant="outlined" onClick={() => void doSearch(searchQuery)}>重新搜索</mdui-button>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="search-results" aria-live="polite">
            <p className="search-results-count">找到 {searchResults.length} 条结果</p>
            {searchResults.map(r => (
              <mdui-card key={r.objectID ?? r.id} className="search-result-card" variant="elevated">
                <p className="search-result-label qa-label"><mdui-icon-question-mark></mdui-icon-question-mark> {r.nickname || "匿名"} 在 {formatSearchTime(r.created_at)} 的提问</p>
                <p className="search-result-question"><MarkdownContent text={r.content} /></p>
                <mdui-divider className="search-result-divider"></mdui-divider>
                <p className="search-result-label qa-label"><mdui-icon-question-answer></mdui-icon-question-answer> 回答于 {formatSearchTime(r.answered_at ?? r.published_at ?? r.created_at)}</p>
                {r.answer ? <p className="search-result-answer"><MarkdownContent text={r.answer} /></p> : <p className="search-result-answer muted">暂未回答</p>}
              </mdui-card>
            ))}
          </div>
        ) : searchQuery.trim() ? (
          <p className="search-empty-state muted">没有找到相关问题。</p>
        ) : null}
        <mdui-button slot="action" variant="text" type="button" onClick={() => setSearchOpen(false)}>关闭</mdui-button>
      </mdui-dialog>
    </>
  );
}
