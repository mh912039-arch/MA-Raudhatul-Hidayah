import { currentStaff } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Panel Pengelola",
  robots: { index: false, follow: false },
};
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const staff = await currentStaff();
  if (!staff) redirect("/login");
  return (
    <AdminShell role={staff.role} name={staff.name}>
      {children}
    </AdminShell>
  );
}
