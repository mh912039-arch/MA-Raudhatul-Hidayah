import { getSchool } from "@/lib/data";
import { PageBanner } from "@/components/PageBanner";
import { ProfileTabs } from "@/components/school/ProfileTabs";
export const metadata = { title: "Profil Sekolah" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ school }, params] = await Promise.all([getSchool(), searchParams]);
  return (
    <>
      <PageBanner
        label="Profil Sekolah"
        title="Mengenal lebih dekat."
        description={school.intro}
      />
      <section className="section container">
        <ProfileTabs school={school} tab={params.tab} />
      </section>
    </>
  );
}
