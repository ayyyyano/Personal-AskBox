"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { searchQuestions, type SearchResult } from "@/lib/algolia";
import { TimeDisplay } from "@/components/TimeDisplay";
import { MarkdownContent } from "@/components/MarkdownContent";
import type { AlgoliaConfig } from "@/lib/algolia-config";

export function SearchView({
  algoliaConfig,
  initialQuery,
}: {
  algoliaConfig: AlgoliaConfig;
  initialQuery: string;
}) {
  const normalizedInitialQuery = initialQuery.trim();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [busy, setBusy] = useState(Boolean(normalizedInitialQuery));
  const [searched, setSearched] = useState(Boolean(normalizedInitialQuery));
  const [searchError, setSearchError] = useState(false);
  const searchTimer = useRef<number | undefined>(undefined);
  const searchRequestRef = useRef(0);

  useEffect(() => {
    import("@mdui/icons/search.js");
  }, []);

  const doSearch = useCallback(async (q: string) => {
    const normalizedQuery = q.trim();
    const requestId = ++searchRequestRef.current;
    if (!normalizedQuery) {
      setResults([]);
      setSearched(false);
      setBusy(false);
      setSearchError(false);
      return;
    }
    setBusy(true);
    setSearched(true);
    setSearchError(false);
    try {
      const { hits } = await searchQuestions(normalizedQuery, "status:published", algoliaConfig);
      if (requestId !== searchRequestRef.current) return;
      setResults(hits);
    } catch (err) {
      if (requestId !== searchRequestRef.current) return;
      console.error("Search failed:", err);
      setResults([]);
      setSearchError(true);
    } finally {
      if (requestId === searchRequestRef.current) setBusy(false);
    }
  }, [algoliaConfig]);

  useEffect(() => {
    if (!normalizedInitialQuery) return;

    let active = true;
    const requestId = ++searchRequestRef.current;
    void searchQuestions(normalizedInitialQuery, "status:published", algoliaConfig)
      .then(({ hits }) => {
        if (!active || requestId !== searchRequestRef.current) return;
        setResults(hits);
        setSearchError(false);
      })
      .catch((error) => {
        if (!active || requestId !== searchRequestRef.current) return;
        console.error("Search failed:", error);
        setResults([]);
        setSearchError(true);
      })
      .finally(() => {
        if (active && requestId === searchRequestRef.current) setBusy(false);
      });

    return () => {
      active = false;
    };
  }, [algoliaConfig, normalizedInitialQuery]);

  useEffect(() => {
    return () => {
      if (searchTimer.current !== undefined) window.clearTimeout(searchTimer.current);
    };
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    searchRequestRef.current += 1;
    setQuery(value);
    if (searchTimer.current !== undefined) window.clearTimeout(searchTimer.current);
    if (!value.trim()) {
      setResults([]);
      setSearched(false);
      setBusy(false);
      setSearchError(false);
      window.history.replaceState(null, "", "/search");
      return;
    }
    searchTimer.current = window.setTimeout(() => {
      void doSearch(value);
      window.history.replaceState(null, "", `/search?q=${encodeURIComponent(value)}`);
    }, 300);
  };

  return (
    <main className="shell page-main search-page">
      <section className="page-intro">
        <p className="eyebrow">公开搜索</p>
        <h1 className="page-title">搜索问题</h1>
      </section>
      <input
        type="text"
        value={query}
        onChange={onChange}
        placeholder="输入关键词搜索…"
        autoFocus
        style={{
          width: "100%",
          padding: "12px 16px",
          borderRadius: 12,
          border: "1px solid rgb(var(--mdui-color-outline))",
          background: "rgb(var(--mdui-color-surface-container-high))",
          color: "rgb(var(--mdui-color-on-surface))",
          font: "inherit",
          fontSize: "1rem",
          outline: "none",
        }}
      />
      {busy ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
          <mdui-circular-progress />
        </div>
      ) : searchError ? (
        <div className="search-empty-state">
          <p>搜索服务暂时不可用，请稍后重试。</p>
          <mdui-button type="button" variant="outlined" onClick={() => void doSearch(query)}>重新搜索</mdui-button>
        </div>
      ) : searched ? (
        <div style={{ marginTop: 24, display: "grid", gap: 12 }}>
          {results.length === 0 ? (
            <p className="muted">没有找到相关问题。</p>
          ) : (
            results.map((r) => (
              <article
                key={r.objectID ?? r.id}
                style={{
                  padding: 16,
                  borderRadius: 12,
                  background: "rgb(var(--mdui-color-surface-container))",
                }}
              >
                <p style={{ margin: "0 0 8px", fontWeight: 500 }}><MarkdownContent text={r.content} /></p>
                {r.answer ? (
                  <p style={{ margin: "0 0 8px", fontSize: "0.875rem", color: "rgb(var(--mdui-color-on-surface-variant))" }}>
                    <MarkdownContent text={r.answer} />
                  </p>
                ) : null}
                <span style={{ fontSize: "0.75rem", color: "rgb(var(--mdui-color-on-surface-variant))" }}>
                  {r.nickname || "匿名"} · {r.published_at ? <TimeDisplay date={r.published_at} /> : r.created_at}
                </span>
              </article>
            ))
          )}
        </div>
      ) : null}
    </main>
  );
}
