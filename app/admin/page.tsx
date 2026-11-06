import { AdminMenu } from "@/components/AdminMenu";
import { AdminLogin } from "@/components/AdminLogin";
import { isAdmin } from "@/lib/auth";

export default async function AdminPage() {
  const ok = await isAdmin();
  if (!ok) {
    return (
      <main className="shell page-main admin-content admin-login-page" aria-label="管理员登录">
        <div className="admin-login-card">
          <AdminLogin />
        </div>
      </main>
    );
  }

  return (
    <main className="shell page-main admin-content" aria-label="管理后台">
      <AdminMenu />
    </main>
  );
}
