import { AdminInbox } from "@/components/AdminInbox";
import { isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminQuestionsPage() {
  if (!(await isAdmin())) redirect("/admin");

  return (
    <main className="shell page-main admin-content" aria-label="问题管理">
      <AdminInbox />
    </main>
  );
}
