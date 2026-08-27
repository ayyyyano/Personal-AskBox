"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { searchQuestions, type SearchResult } from "@/lib/algolia";
import { useSearchParams, useRouter } from "next/navigation";
import { TimeDisplay } from "@/components/TimeDisplay";
import { MarkdownContent } from "@/components/MarkdownContent";
import type { AlgoliaConfig } from "@/lib/algolia-config";

export function SearchView({ algoliaConfig }: { algoliaConfig: AlgoliaConfig }) {
  const params = useSearchParams();
  const router = useRouter();
  const initialQuery = params.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [busy, setBusy] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    import("@mdui/icons/search.js");
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setBusy(true);
    setSearched(true);
    try {
      const { hits } = await searchQuestions(q, "status:published", algoliaConfig);
      setResults(hits);
    } catch (err) {
      console.error("Search failed:", err);
    }
    setBusy(false);
  }, [algoliaConfig]);

  useEffect(() => {
    if (initialQuery) void doSearch(initialQuery);
  }, [initialQuery, doSearch]);

  const searchTimer = useRef<number | undefined>(undefined);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (searchTimer.current !== undefined) window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => {
      doSearch(value);
      router.replace(`/search?q=${encodeURIComponent(value)}`);
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
