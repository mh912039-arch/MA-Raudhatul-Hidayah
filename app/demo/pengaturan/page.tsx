import { SchoolSettings } from "@/components/admin/SchoolSettings";
import { sampleSchool } from "@/lib/sample";
export default function Page() {
  return <SchoolSettings school={sampleSchool} demo />;
}
