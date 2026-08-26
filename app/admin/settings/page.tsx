import { AdminSettings } from "@/components/AdminSettings";
import { isAdmin } from "@/lib/auth";
import { getSiteSettings } from "@/lib/site-settings";
import { redirect } from "next/navigation";

export default async function AdminSettingsPage() {
  if (!(await isAdmin())) redirect("/admin");
  const settings = await getSiteSettings();

  return (
    <main className="shell admin-content">
      <AdminSettings initialSettings={settings} />
    </main>
  );
}
