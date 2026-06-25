"use client";
import Link from "next/link";
import { useEffect } from "react";
import { siteName } from "@/lib/env";

export function Header({ admin = false }: { admin?: boolean }) {
  useEffect(() => {
    import("@mdui/icons/admin-panel-settings.js");
  }, []);

  return (
    <header className="shell topbar">
      <Link href="/" className="brand">
        <span className="brand-mark">问</span>
        <span>{siteName()}</span>
      </Link>
      {admin ? (
        <form action="/api/admin/logout" method="post">
          <mdui-button variant="text" type="submit">退出</mdui-button>
        </form>
      ) : (
        <Link href="/admin">
          <mdui-button-icon aria-label="管理后台">
            <mdui-icon-admin-panel-settings></mdui-icon-admin-panel-settings>
          </mdui-button-icon>
        </Link>
      )}
    </header>
  );
}
