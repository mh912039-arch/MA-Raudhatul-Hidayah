import { requireRole } from "@/lib/auth";
import { db } from "@/lib/supabase/server";
import { Dashboard } from "@/components/admin/Dashboard";
import { listRegistrations } from "@/lib/admin-data";
export default async function Page() {
  const staff = await requireRole(["super_admin", "admin", "humas"]);
  const c = await db();
  const [rows, p] = await Promise.all([
    staff.role === "humas" ? Promise.resolve([]) : listRegistrations(),
    c.from("posts").select("id", { count: "exact", head: true }),
  ]);
  if (p.error) throw new Error("Ringkasan belum dapat dimuat.");
  return (
    <Dashboard
      registrations={rows}
      postCount={p.count ?? 0}
      role={staff.role}
    />
  );
}
