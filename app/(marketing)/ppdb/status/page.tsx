import { PageBanner } from "@/components/PageBanner";
import { StatusForm } from "@/components/ppdb/StatusForm";
import { getSchool } from "@/lib/data";
export const metadata = { title: "Cek Status Pendaftaran" };
export default async function Page() {
  const { demo } = await getSchool();
  return (
    <>
      <PageBanner label="Status PPDB" title="Perjalananmu, dalam pantauan." />
      <section className="section container">
        <StatusForm demo={demo} />
      </section>
    </>
  );
}
