import type { Metadata } from "next";
import "./globals.css";
import { AppChrome } from "@/components/AppChrome";
import { MduiBoot } from "@/components/MduiBoot";
import { SiteProvider } from "@/components/SiteProvider";

export const metadata: Metadata = {
  description: "一个基于 Next.js、MDUI 2 和 Cloudflare 的个人匿名提问箱",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="mdui-theme-auto">
      <body>
        <MduiBoot />
        <SiteProvider><AppChrome>{children}</AppChrome></SiteProvider>
      </body>
    </html>
  );
}
