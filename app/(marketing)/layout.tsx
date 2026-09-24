export const dynamic = "force-dynamic";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getSchool } from "@/lib/data";
export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { school, demo, unavailable } = await getSchool();
  return (
    <>
      <Header name={school.name} />
      {unavailable && (
        <div className="notice danger">
          Informasi sekolah sedang dalam pemeliharaan. Pendaftaran sementara
          dinonaktifkan.
        </div>
      )}
      <main id="main">{children}</main>
      <Footer school={school} demo={demo} />
    </>
  );
}

export async function generateMetadata() { const { school } = await getSchool(); return {title:{default:`${school.name} — Profil Sekolah & PPDB`,template:`%s | ${school.name}`},description:school.intro.slice(0,160)}; }
