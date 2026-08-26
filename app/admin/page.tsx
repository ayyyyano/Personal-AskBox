import { AdminMenu } from "@/components/AdminMenu";
import { AdminLogin } from "@/components/AdminLogin";
import { isAdmin } from "@/lib/auth";
import { getSiteSettings } from "@/lib/site-settings";

export default async function AdminPage() {
  const ok = await isAdmin();
  if (!ok) {
    const settings = await getSiteSettings();
    return (
      <main className="shell page-main admin-content split-page">
        <section className="page-intro admin-page-intro">
          <p className="eyebrow">管理后台</p>
          <h1 className="page-title">{settings.adminLoginTitle}</h1>
          <p className="lede">登录后查看收到的问题，并管理公开展示内容。</p>
        </section>
        <div className="admin-login-card">
          <AdminLogin />
        </div>
      </main>
    );
  }

  return (
    <main className="shell page-main admin-content">
      <AdminMenu />
    </main>
  );
}
