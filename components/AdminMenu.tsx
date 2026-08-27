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
    <section className="admin-menu" aria-labelledby="admin-menu-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">管理后台</p>
          <h1 id="admin-menu-title" className="page-title">你想管理什么？</h1>
          <p className="lede">选择一个功能开始。</p>
        </div>
      </div>
      <mdui-card className="admin-menu-card" variant="outlined">
        <mdui-list>
          <Link href="/admin/questions" className="admin-menu-link">
            <mdui-list-item headline="问题列表" description="查看、回答、发布或删除收到的问题" rounded>
              <mdui-icon-list slot="icon"></mdui-icon-list>
              <mdui-icon-arrow-forward slot="end-icon"></mdui-icon-arrow-forward>
            </mdui-list-item>
          </Link>
          <Link href="/admin/settings" className="admin-menu-link">
            <mdui-list-item headline="自定义设置" description="个性化网站内容与显示选项" rounded>
              <mdui-icon-settings slot="icon"></mdui-icon-settings>
              <mdui-icon-arrow-forward slot="end-icon"></mdui-icon-arrow-forward>
            </mdui-list-item>
          </Link>
        </mdui-list>
      </mdui-card>
    </section>
  );
}
