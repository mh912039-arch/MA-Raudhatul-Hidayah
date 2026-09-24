import Link from "next/link";
import { ArrowUpRight, Users, Newspaper, FileCheck2 } from "lucide-react";
import type { Registration, Role } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
export function Dashboard({
  registrations,
  postCount,
  role,
  demo = false,
}: {
  registrations: Registration[];
  postCount: number;
  role: Role;
  demo?: boolean;
}) {
  const prefix = demo ? "/demo" : "/admin";
  return (
    <>
      <div className="admin-header">
        <div>
          <div className="eyebrow">PANEL SEKOLAH</div>
          <h1>Selamat datang, Pengelola.</h1>
          <p>Informasi sekolah dan penerimaan siswa dalam satu tempat.</p>
        </div>
        <Link href="/" className="button outline">
          Lihat website <ArrowUpRight size={17} />
        </Link>
      </div>
      {demo && (
        <div className="notice admin-demo">
          Panel demonstrasi — seluruh data di bawah adalah contoh. Perubahan
          demo hanya berlaku selama halaman ini dibuka.
        </div>
      )}
      <div className="admin-stats">
        {(role === "humas"
          ? [
              ["Berita sekolah", postCount],
              ["Akses Anda", "Humas"],
            ]
          : [
              ["Total pendaftar", registrations.length],
              [
                "Menunggu verifikasi",
                registrations.filter((r) => r.status === "Menunggu").length,
              ],
              [
                "Diterima",
                registrations.filter((r) => r.status === "Diterima").length,
              ],
              [
                "Perlu revisi",
                registrations.filter((r) => r.status === "Perlu revisi").length,
              ],
            ]
        ).map(([label, value]) => (
          <div className="stat-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="content-grid">
        <div className="panel">
          <div className="toolbar">
            <h3>
              {role === "humas" ? "Ruang publikasi" : "Pendaftar terbaru"}
            </h3>
            {role !== "humas" && (
              <Link className="text-link" href={`${prefix}/ppdb`}>
                Lihat semua <ArrowUpRight size={15} />
              </Link>
            )}
          </div>
          {role === "humas" ? (
            <p>
              Publikasikan berita, pengumuman, dan dokumentasi kegiatan melalui
              menu Konten Sekolah.
            </p>
          ) : (
            <Table className="admin-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Nama siswa</TableHead>
                  <TableHead>Registrasi</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrations.slice(0, 5).map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <strong>{r.student_name}</strong>
                      <small className="block muted">{r.previous_school}</small>
                    </TableCell>
                    <TableCell>{r.registration_number}</TableCell>
                    <TableCell>
                      <span
                        className={`badge ${r.status === "Diterima" ? "accepted" : r.status === "Ditolak" ? "rejected" : "waiting"}`}
                      >
                        {r.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {role !== "humas" && !registrations.length && (
            <div className="empty">Belum ada pendaftaran masuk.</div>
          )}
        </div>
        <div className="panel stack">
          <h3>Akses cepat</h3>
          {role !== "humas" && (
            <Link href={`${prefix}/ppdb`} className="check-line">
              <FileCheck2 size={20} />
              <span>Periksa berkas pendaftar</span>
              <ArrowUpRight size={16} />
            </Link>
          )}
          <Link href={`${prefix}/konten`} className="check-line">
            <Newspaper size={20} />
            <span>Kelola konten sekolah</span>
            <ArrowUpRight size={16} />
          </Link>
          <div className="divider" />
          <p className="small">
            Pastikan catatan verifikasi jelas agar orang tua mengetahui tindak
            lanjut yang diperlukan.
          </p>
        </div>
      </div>
    </>
  );
}
