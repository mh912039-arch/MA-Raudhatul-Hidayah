"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Registration, Status } from "@/lib/types";
import {
  verifyRegistration,
  documentLink,
  auditLog,
} from "@/app/actions/admin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Search, FileText, History } from "lucide-react";
export function VerificationTable({
  rows,
  demo = false,
}: {
  rows: Registration[];
  demo?: boolean;
}) {
  const router = useRouter();
  const [local, setLocal] = useState(rows);
  const source = demo ? local : rows;
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Semua");
  const [selected, setSelected] = useState<Registration | null>(null);
  const [status, setStatus] = useState<Status>("Menunggu");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [logs, setLogs] = useState<
    {
      new_status: string;
      notes: string;
      actor_id: string | null;
      created_at: string;
    }[]
  >([]);
  const [doc, setDoc] = useState("");
  const matches = source.filter(
    (r) =>
      (filter === "Semua" || r.status === filter) &&
      `${r.student_name} ${r.registration_number} ${r.nisn}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  async function open(r: Registration) {
    setSelected(r);
    setStatus(r.status);
    setNotes(r.notes);
    setLogs([]);
    setDoc("");
    if (!demo) {
      const v = await auditLog(r.id);
      if (v.data) setLogs(v.data);
    }
  }
  async function save() {
    if (!selected) return;
    if (
      ["Perlu revisi", "Ditolak"].includes(status) &&
      notes.trim().length < 5
    ) {
      toast.error("Isi catatan minimal 5 karakter.");
      return;
    }
    setBusy(true);
    try {
      if (demo) {
        setLocal(
          local.map((r) =>
            r.id === selected.id ? { ...r, status, notes } : r,
          ),
        );
        toast.success("Status contoh diperbarui untuk sesi ini.");
        setSelected(null);
      } else {
        const r = await verifyRegistration({
          id: selected.id,
          status,
          notes,
          updated_at: selected.updated_at,
        });
        if (r.error) toast.error(r.error);
        else {
          toast.success(r.success);
          setSelected(null);
          router.refresh();
        }
      }
    } catch {
      toast.error("Koneksi terputus. Coba kembali.");
    } finally {
      setBusy(false);
    }
  }
  async function view(kind: "report" | "birth") {
    if (!selected) return;
    if (demo) {
      toast.info("Dokumen contoh tidak memuat berkas pribadi.");
      return;
    }
    const r = await documentLink({ id: selected.id, kind });
    if (r.error) toast.error(r.error);
    else if (r.url) setDoc(r.url);
  }
  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Pendaftar PPDB</h1>
          <p>Periksa data, verifikasi berkas, dan berikan keputusan.</p>
        </div>
        <span className="badge">
          {source.length} pendaftar{demo ? " contoh" : ""}
        </span>
      </div>
      {demo && (
        <div className="notice admin-demo">
          Data demonstrasi. Perubahan tidak tersimpan setelah halaman dimuat
          ulang.
        </div>
      )}
      <div className="panel">
        <div className="toolbar">
          <label
            className="search-input"
            style={{ display: "flex", gap: 9, alignItems: "center" }}
          >
            <Search size={18} />
            <input
              className="input"
              placeholder="Nama, NISN, atau nomor registrasi"
              aria-label="Cari pendaftar"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Semua", "Menunggu", "Perlu revisi", "Diterima", "Ditolak"].map(
                (s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>
        <Table className="admin-table">
          <TableHeader>
            <TableRow>
              <TableHead>Pendaftar</TableHead>
              <TableHead>Nomor registrasi</TableHead>
              <TableHead>Asal sekolah</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <strong>{r.student_name}</strong>
                  <small className="block muted">NISN {r.nisn}</small>
                </TableCell>
                <TableCell>{r.registration_number}</TableCell>
                <TableCell>{r.previous_school}</TableCell>
                <TableCell>
                  <span
                    className={`badge ${r.status === "Diterima" ? "accepted" : r.status === "Ditolak" ? "rejected" : "waiting"}`}
                  >
                    {r.status}
                  </span>
                </TableCell>
                <TableCell>
                  <button onClick={() => void open(r)}>Periksa berkas →</button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!matches.length && (
          <div className="empty">Tidak ada pendaftar yang sesuai.</div>
        )}
      </div>
      <Sheet
        open={!!selected}
        onOpenChange={(v) => {
          if (!v) setSelected(null);
        }}
      >
        <SheetContent className="sm:max-w-xl w-full overflow-y-auto p-7">
          <SheetTitle>Verifikasi pendaftaran</SheetTitle>
          <SheetDescription>{selected?.registration_number}</SheetDescription>
          {selected && (
            <div className="stack">
              <h2 style={{ fontSize: 27 }}>{selected.student_name}</h2>
              <dl className="detail-list">
                {[
                  ["NISN", selected.nisn],
                  ["Asal sekolah", selected.previous_school],
                  ["Tanggal lahir", selected.birth_date],
                  ["Jenis kelamin", selected.gender],
                  ["Orang tua", selected.parent_name],
                  ["Telepon", selected.parent_phone],
                  ["Email", selected.email],
                  ["Alamat", selected.address],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="action-row">
                <button
                  className="button outline"
                  onClick={() => void view("report")}
                >
                  <FileText size={16} /> Rapor
                </button>
                <button
                  className="button outline"
                  onClick={() => void view("birth")}
                >
                  <FileText size={16} /> Akta
                </button>
              </div>
              {doc && (
                <a
                  href={doc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="notice info"
                >
                  Buka dokumen terlindungi ↗ (tautan berlaku 2 menit)
                </a>
              )}
              <label className="field">
                Status verifikasi
                <Select
                  value={status}
                  onValueChange={(v) => setStatus(v as Status)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Menunggu", "Perlu revisi", "Diterima", "Ditolak"].map(
                      (s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </label>
              <label className="field">
                Catatan untuk pendaftar
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={2000}
                  placeholder="Jelaskan dokumen yang perlu diperbaiki atau alasan keputusan."
                />
              </label>
              <button
                className="button navy"
                disabled={busy}
                onClick={() => void save()}
              >
                {busy ? "Menyimpan…" : "Simpan hasil verifikasi"}
              </button>
              <div className="divider" />
              <h3>
                <History
                  size={17}
                  style={{ display: "inline", marginRight: 8 }}
                />
                Riwayat verifikasi
              </h3>
              {logs.map((l, i) => (
                <div key={i} className="small">
                  <strong>{l.new_status}</strong>
                  <p className="muted">
                    {l.notes || "Tanpa catatan"}
                    <br />
                    {new Date(l.created_at).toLocaleString("id-ID", {
                      timeZone: "Asia/Jakarta",
                    })}
                    <br />
                    Petugas: {l.actor_id || "Sistem"}
                  </p>
                </div>
              ))}
              {!logs.length && (
                <p className="muted small">Belum ada riwayat verifikasi.</p>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
