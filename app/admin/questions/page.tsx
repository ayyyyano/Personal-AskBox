import { AdminInbox } from "@/components/AdminInbox";
import { isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminQuestionsPage() {
  if (!(await isAdmin())) redirect("/admin");

  return (
    <main className="shell page-main admin-content">
      <section className="page-intro admin-page-intro">
        <p className="eyebrow">收件箱</p>
        <h1 className="page-title">问题列表</h1>
        <p className="lede">集中处理收到的问题，回答后可以选择将内容发布到公开展示页。</p>
      </section>
      <AdminInbox />
    </main>
  );
}
