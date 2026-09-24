import { getGallery } from "@/lib/data";
import { PageBanner } from "@/components/PageBanner";
import { Gallery } from "@/components/Gallery";
export const metadata = { title: "Galeri Sekolah" };
export default async function Page() {
  return (
    <>
      <PageBanner
        label="Galeri"
        title="Setiap momen, sebuah cerita."
        description="Jelajahi lingkungan belajar dan keseharian warga sekolah."
      />
      <section className="section container">
        <Gallery items={await getGallery()} />
      </section>
    </>
  );
}
