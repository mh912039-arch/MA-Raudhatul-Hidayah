import { Dashboard } from "@/components/admin/Dashboard";
import { demoRegistrations } from "@/lib/demo-admin";
export default function Page() {
  return (
    <Dashboard
      registrations={demoRegistrations}
      postCount={3}
      role="super_admin"
      demo
    />
  );
}
