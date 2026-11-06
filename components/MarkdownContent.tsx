"use client";
import { useMemo } from "react";
import { renderMarkdown } from "@/lib/markdown";

export function MarkdownContent({ text }: { text: string }) {
  const html = useMemo(() => renderMarkdown(text), [text]);
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}
