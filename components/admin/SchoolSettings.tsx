"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { School } from "@/lib/types";
import { schoolSchema } from "@/lib/validation";
import { saveSchool, uploadMedia } from "@/app/actions/admin";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
export function SchoolSettings({
  school,
  demo = false,
}: {
  school: School;
  demo?: boolean;
}) {
  const [value, setValue] = useState(school);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  function field(
    key: keyof School,
    label: string,
    area = false,
    type = "text",
  ) {
    return (
      <label className="field">
        {label}
        {area ? (
          <textarea
            value={String(value[key])}
            onChange={(e) => setValue({ ...value, [key]: e.target.value })}
          />
        ) : (
          <input
            type={type}
            value={String(value[key])}
            onChange={(e) => setValue({ ...value, [key]: e.target.value })}
          />
        )}
      </label>
    );
  }
  async function save() {
    setError("");
    const p = schoolSchema.safeParse(value);
    if (!p.success) {
      setError(p.error.issues[0].message);
      return;
    }
    if (demo) {
      toast.info(
        "Pengaturan contoh berubah di formulir ini. Data website tetap sama.",
      );
      return;
    }
    setBusy(true);
    try {
      const r = await saveSchool(p.data);
      if (r.error) setError(r.error);
      else {
        toast.success(r.success);
        router.refresh();
      }
    } catch {
      setError("Koneksi terputus. Coba kembali.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Pengaturan sekolah</h1>
          <p>
            Identitas, profil, kontak, serta periode PPDB. Khusus super admin.
          </p>
        </div>
      </div>
      {demo && (
        <div className="notice admin-demo">
          Mode demonstrasi: pengaturan belum terhubung dengan data sekolah.
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
        className="stack"
      >
        <div className="panel">
          <h2>Identitas & profil</h2>
          <div className="form-grid">
            {field("name", "Nama sekolah")}
            {field("short_name", "Nama singkat")}
            <div className="full">{field("tagline", "Tagline")}</div>
            <div className="full">
              {field("intro", "Tentang sekolah", true)}
            </div>
            {field("principal_name", "Nama kepala sekolah")}
            <label className="field">
              Foto kepala sekolah
              <input
                type="file"
                accept="image/webp"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  if (f.type !== "image/webp" || f.size > 500 * 1024) {
                    setError("Foto kepala sekolah harus WebP maksimal 500 KB.");
                    return;
                  }
                  if (demo) {
                    toast.info("Foto contoh tidak disimpan.");
                    return;
                  }
                  setBusy(true);
                  try {
                    const form = new FormData();
                    form.set("file", f);
                    form.set("principal", "true");
                    const r = await uploadMedia(form);
                    if (r.error) setError(r.error);
                    else if (r.url)
                      setValue({ ...value, principal_image: r.url });
                  } finally {
                    setBusy(false);
                  }
                }}
              />
              <small>WebP · Maksimal 500 KB</small>
            </label>
            <div className="full">
              {field("principal_message", "Sambutan kepala sekolah", true)}
            </div>
            <div className="full">{field("vision", "Visi", true)}</div>
            <label className="field full">
              Misi
              <textarea
                value={value.mission.join("\n")}
                onChange={(e) =>
                  setValue({ ...value, mission: e.target.value.split("\n") })
                }
                rows={5}
              />
              <small>Satu misi per baris.</small>
            </label>
          </div>
        </div>
        <div className="panel">
          <h2>Kontak & lokasi</h2>
          <div className="form-grid">
            {field("phone", "Telepon sekolah")}
            {field("email", "Email sekolah", false, "email")}
            <div className="full">
              {field("address", "Alamat lengkap", true)}
            </div>
            <div className="full">
              {field("maps_url", "URL Google Maps Embed")}
              <p className="small muted">
                Tempel URL pada atribut src iframe Google Maps, bukan seluruh
                kode iframe.
              </p>
            </div>
          </div>
        </div>
        <div className="panel">
          <h2>Penerimaan siswa & operasional</h2>
          <div className="form-grid">
            {field("academic_year", "Tahun ajaran")}
            {field("ppdb_start", "Tanggal mulai", false, "date")}
            {field("ppdb_end", "Tanggal berakhir", false, "date")}
            <label className="field">
              Buka pendaftaran
              <Switch
                checked={value.ppdb_open}
                onCheckedChange={(v) => setValue({ ...value, ppdb_open: v })}
                aria-label="Buka pendaftaran"
              />
            </label>
            <label className="field full">
              Mode pemeliharaan (baca-saja)
              <Switch
                checked={value.maintenance}
                onCheckedChange={(v) => setValue({ ...value, maintenance: v })}
                aria-label="Mode pemeliharaan"
              />
              <small>
                Menutup pendaftaran dan menghentikan perubahan konten serta
                verifikasi. Pengaturan tetap dapat diubah super admin.
              </small>
            </label>
          </div>
        </div>
        {error && (
          <div role="alert" className="notice danger">
            {error}
          </div>
        )}
        <button
          className="button navy"
          disabled={busy}
          style={{ alignSelf: "start" }}
        >
          {busy ? "Menyimpan…" : "Simpan pengaturan"}
        </button>
      </form>
    </>
  );
}
