import { VerificationTable } from "@/components/admin/VerificationTable";
import { demoRegistrations } from "@/lib/demo-admin";
export default function Page() {
  return <VerificationTable rows={demoRegistrations} demo />;
}
