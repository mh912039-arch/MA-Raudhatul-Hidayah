import Link from "next/link";
import { getSchool, isOpen, dateID } from "@/lib/data";
import { PageBanner } from "@/components/PageBanner";
import { RegistrationForm } from "@/components/ppdb/RegistrationForm";
import { CalendarDays, FileText, ShieldCheck } from "lucide-react";
export const metadata = { title: "PPDB Online" };
export default async function Page() {
  const { school, demo } = await getSchool();
  return (
    <>
      <PageBanner
        label="PPDB Online"
        title="Langkah awal cerita besarmu."
        description={`Penerimaan peserta didik baru tahun ajaran ${school.academic_year}. Isi data, unggah berkas, dan pantau status pendaftaran dari rumah.`}
      />
      <section className="section container content-grid">
        <RegistrationForm demo={demo} open={isOpen(school)} />
        <aside className="stack">
          <div className="panel">
            <span
              className={`badge ${isOpen(school) ? "accepted" : "waiting"}`}
            >
              {isOpen(school) ? "Pendaftaran dibuka" : "Pendaftaran ditutup"}
            </span>
            <h3 style={{ marginTop: 20 }}>
              Tahun ajaran {school.academic_year}
            </h3>
            <p className="small">
              <CalendarDays
                size={16}
                style={{ display: "inline", marginRight: 8 }}
              />
              {dateID(school.ppdb_start)} – {dateID(school.ppdb_end)}
            </p>
            <div className="divider" />
            <h3>Siapkan sebelum mendaftar</h3>
            <div className="stack">
              {[
                "NISN dan data diri siswa",
                "Data orang tua / wali dan alamat",
                "Scan rapor dan akta kelahiran",
              ].map((t) => (
                <div className="check-line" key={t}>
                  <FileText size={16} />
                  {t}
                </div>
              ))}
            </div>
          </div>
          <div className="panel">
            <h3>Alur pendaftaran</h3>
            <div className="step-list">
              {[
                ["Isi formulir", "Lengkapi data siswa dan orang tua."],
                ["Unggah dokumen", "Pastikan tulisan pada berkas terbaca."],
                ["Simpan bukti", "Catat nomor registrasi dan kode akses."],
                ["Pantau hasil", "Tim sekolah memverifikasi berkas Anda."],
              ].map(([t, d], i) => (
                <div key={t}>
                  <b>{i + 1}</b>
                  <div>
                    <h3>{t}</h3>
                    <p>{d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="notice info">
            <ShieldCheck
              size={19}
              style={{ display: "inline", marginRight: 8 }}
            />
            Dokumen hanya dapat diakses petugas berwenang. Simpan kode akses
            Anda secara pribadi.
          </div>
          <Link href="/ppdb/status" className="button outline">
            Sudah mendaftar? Cek status →
          </Link>
        </aside>
      </section>
    </>
  );
}
