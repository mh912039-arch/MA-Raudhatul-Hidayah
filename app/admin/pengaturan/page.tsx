import { requireRole } from "@/lib/auth";
import { getSchool } from "@/lib/data";
import { SchoolSettings } from "@/components/admin/SchoolSettings";
export default async function Page() {
  await requireRole(["super_admin"]);
  const { school, unavailable } = await getSchool();
  if (unavailable) throw new Error("Pengaturan belum dapat dimuat.");
  return <SchoolSettings school={school} />;
}
