"use client";

import Link from "next/link";
import { useEffect } from "react";

export function AdminMenu() {
  useEffect(() => {
    import("@mdui/icons/list.js");
    import("@mdui/icons/settings.js");
    import("@mdui/icons/arrow-forward.js");
  }, []);

  return (
    <section className="admin-menu" aria-label="管理功能">
      <mdui-card className="admin-menu-card" variant="outlined">
        <mdui-list>
          <Link href="/admin/questions" className="admin-menu-link">
            <mdui-list-item headline="问题列表" rounded>
              <mdui-icon-list slot="icon"></mdui-icon-list>
              <mdui-icon-arrow-forward slot="end-icon"></mdui-icon-arrow-forward>
            </mdui-list-item>
          </Link>
          <Link href="/admin/settings" className="admin-menu-link">
            <mdui-list-item headline="自定义设置" rounded>
              <mdui-icon-settings slot="icon"></mdui-icon-settings>
              <mdui-icon-arrow-forward slot="end-icon"></mdui-icon-arrow-forward>
            </mdui-list-item>
          </Link>
        </mdui-list>
      </mdui-card>
    </section>
  );
}
