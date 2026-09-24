import { getSchool } from "@/lib/data";
import { PageBanner } from "@/components/PageBanner";
import { SchoolMap } from "@/components/school/SchoolMap";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
export const metadata = { title: "Kontak Sekolah" };
export default async function Page() {
  const { school, demo } = await getSchool();
  return (
    <>
      <PageBanner
        label="Kontak"
        title="Mari terhubung."
        description="Kenali lokasi sekolah dan hubungi tim kami untuk informasi lebih lanjut."
      />
      <section className="section container content-grid">
        <SchoolMap url={school.maps_url} address={school.address} />
        <div className="stack">
          <h2>Kami siap membantu.</h2>
          {demo && (
            <div className="notice">
              Alamat dan peta pada pratinjau ini adalah contoh lokasi. Kontak
              resmi belum diisi.
            </div>
          )}
          {[
            { icon: MapPin, label: "Alamat sekolah", value: school.address },
            {
              icon: Phone,
              label: "Telepon",
              value: school.phone || "Belum tersedia",
            },
            {
              icon: Mail,
              label: "Email",
              value: school.email || "Belum tersedia",
            },
            {
              icon: Clock,
              label: "Layanan informasi",
              value: "Hubungi sekolah untuk jadwal kunjungan.",
            },
          ].map((x) => (
            <div className="contact-row" key={x.label}>
              <div className="contact-icon">
                <x.icon size={20} />
              </div>
              <div>
                <strong className="small">{x.label}</strong>
                <p className="muted small">{x.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
