import { redirect } from "next/navigation";
import { AdminInbox } from "@/components/AdminInbox";
import { Header } from "@/components/Header";
import { isAdmin } from "@/lib/auth";

export const runtime = "edge";

export default async function AdminPage() {
  const ok = await isAdmin();
  if (!ok) {
    return (
      <>
        <Header />
        <main className="shell">
          <section className="hero">
            <div>
              <h1 className="headline">管理后台</h1>
              <p className="lede">登录后查看匿名问题并发布回答。</p>
            </div>
            <form className="panel form-stack" action="/api/admin/login" method="post">
              <mdui-text-field name="password" label="管理员密码" type="password" required />
              <mdui-button type="submit">登录</mdui-button>
            </form>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <Header admin />
      <main className="shell">
        <AdminInbox />
      </main>
    </>
  );
}
