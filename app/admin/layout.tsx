import { isAdmin } from "@/lib/auth";
import { AdminSession } from "@/components/SiteProvider";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  return <><AdminSession authenticated={await isAdmin()} />{children}</>;
}
