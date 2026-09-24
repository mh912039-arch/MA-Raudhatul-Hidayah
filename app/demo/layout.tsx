import { AdminShell } from "@/components/admin/AdminShell";
export const metadata = {
  title: "Demo Panel Pengelola",
  robots: { index: false, follow: false },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AdminShell role="super_admin" name="Pengelola Demo" demo>
      {children}
    </AdminShell>
  );
}
