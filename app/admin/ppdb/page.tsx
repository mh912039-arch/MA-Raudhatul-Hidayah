import { listRegistrations } from "@/lib/admin-data";
import { VerificationTable } from "@/components/admin/VerificationTable";
export default async function Page() {
  return <VerificationTable rows={await listRegistrations()} />;
}
