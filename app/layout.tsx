import type { Metadata } from "next";
import "./globals.css";
import { MduiBoot } from "@/components/MduiBoot";
import { siteName } from "@/lib/env";

export const metadata: Metadata = {
  title: siteName(),
  description: "一个基于 Next.js、MDUI 2 和 Cloudflare 的个人匿名提问箱"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="mdui-theme-auto">
      <body>
        <MduiBoot />
        {children}
      </body>
    </html>
  );
}
