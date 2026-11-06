"use client";

import { useSyncExternalStore } from "react";

export type PublicView = "ask" | "display";
const viewEvent = "askbox-view-change";

function subscribe(listener: () => void) {
  window.addEventListener("hashchange", listener);
  window.addEventListener("popstate", listener);
  window.addEventListener(viewEvent, listener);
  return () => {
    window.removeEventListener("hashchange", listener);
    window.removeEventListener("popstate", listener);
    window.removeEventListener(viewEvent, listener);
  };
}

export function usePublicView(): PublicView {
  return useSyncExternalStore(subscribe, () => window.location.hash === "#display" ? "display" : "ask", () => "ask");
}

export function usePublicSearchQuery() {
  return useSyncExternalStore(subscribe, () => window.location.pathname === "/" ? new URLSearchParams(window.location.search).get("q") ?? "" : "", () => "");
}

export function navigatePublicView(view: PublicView) {
  const hash = view === "display" ? "#display" : "";
  if (window.location.hash === hash) return;
  window.history.pushState(null, "", `${window.location.pathname}${window.location.search}${hash}`);
  window.dispatchEvent(new Event(viewEvent));
}
