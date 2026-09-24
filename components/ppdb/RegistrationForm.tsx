"use client";
import { randomId } from "@/lib/random-id";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  Upload,
  CheckCircle2,
  Printer,
  FileCheck2,
  LoaderCircle,
} from "lucide-react";
import { registrationSchema, documentError } from "@/lib/validation";
import { submitRegistration } from "@/app/actions/ppdb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
const initial = {
  student_name: "",
  nisn: "",
  birth_date: "",
  gender: "",
  previous_school: "",
  parent_name: "",
  parent_phone: "",
  email: "",
  address: "",
  website: "",
};
const steps = ["Data siswa", "Orang tua", "Berkas", "Konfirmasi"];
export function RegistrationForm({
  demo,
  open,
}: {
  demo: boolean;
  open: boolean;
}) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState(initial);
  const [files, setFiles] = useState<{ report?: File; birth?: File }>({});
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<{
    number: string;
    demo: boolean;
  } | null>(null);
  const [identity] = useState(() => ({ request_id: "", access_token: "" }));
  function field(
    key: keyof typeof values,
    label: string,
    type = "text",
    placeholder = "",
    wide = false,
  ) {
    return (
      <label className={`field ${wide ? "full" : ""}`}>
        {label}
        <input
          name={key}
          type={type}
          value={values[key]}
          placeholder={placeholder}
          onChange={(e) => setValues({ ...values, [key]: e.target.value })}
          maxLength={key === "nisn" ? 10 : key === "address" ? 500 : 150}
          autoComplete={
            key === "email"
              ? "email"
              : key === "parent_phone"
                ? "tel"
                : undefined
          }
        />
      </label>
    );
  }
  function ensureIdentity() {
    if (!identity.request_id) {
      identity.request_id = randomId();
      identity.access_token = [...crypto.getRandomValues(new Uint8Array(32))]
        .map((x) => x.toString(16).padStart(2, "0"))
        .join("");
    }
  }
  function next() {
    ensureIdentity();
    setError("");
    const parsed = registrationSchema.safeParse({
      ...values,
      ...identity,
      consent: true,
    });
    const keys =
      step === 0
        ? ["student_name", "nisn", "birth_date", "gender", "previous_school"]
        : ["parent_name", "parent_phone", "email", "address"];
    if (step < 2 && !parsed.success) {
      const issue = parsed.error.issues.find((i) =>
        keys.includes(String(i.path[0])),
      );
      if (issue) {
        setError(issue.message);
        return;
      }
    }
    if (step === 2) {
      const err = documentError(files.report) || documentError(files.birth);
      if (err) {
        setError(err);
        return;
      }
    }
    setStep((s) => Math.min(s + 1, 3));
  }
  async function send() {
    setError("");
    if (!consent) {
      setError("Centang persetujuan sebelum mengirim pendaftaran.");
      return;
    }
    setBusy(true);
    ensureIdentity();
    const form = new FormData();
    Object.entries({ ...values, ...identity, consent: "true" }).forEach(
      ([k, v]) => form.set(k, v),
    );
    form.set("report", files.report!);
    form.set("birth", files.birth!);
    try {
      const result = await submitRegistration(form);
      if (result.error) setError(result.error);
      else if (result.number)
        setReceipt({ number: result.number, demo: !!result.demo });
    } catch {
      setError("Koneksi terputus. Coba kirim kembali; isian tetap tersedia.");
    } finally {
      setBusy(false);
    }
  }
  if (receipt)
    return (
      <div className="panel receipt stack">
        <CheckCircle2 size={50} />
        <h2>{receipt.demo ? "Simulasi selesai" : "Pendaftaran berhasil"}</h2>
        <p>
          {receipt.demo
            ? "Ini bukti simulasi. Data dan dokumen tidak disimpan."
            : "Simpan nomor registrasi dan kode akses berikut untuk memantau hasil verifikasi."}
        </p>
        <div className="receipt-code">{receipt.number}</div>
        <p className="small">Kode akses pribadi</p>
        <div className="receipt-token">
          {receipt.demo ? "DEMO" : identity.access_token}
        </div>
        <p className="small">
          {values.student_name} · {values.previous_school}
        </p>
        <div
          className="action-row no-print"
          style={{ justifyContent: "center" }}
        >
          <button className="button navy" onClick={() => window.print()}>
            <Printer size={17} /> Cetak bukti
          </button>
          <Link href="/ppdb/status" className="button outline">
            Cek status
          </Link>
        </div>
      </div>
    );
  return (
    <div className="panel">
      <div className="eyebrow">FORMULIR PENDAFTARAN</div>
      <h2>Satu langkah lebih dekat.</h2>
      {demo && (
        <div className="notice">
          Mode demonstrasi: gunakan data dan dokumen contoh. Isian tidak
          disimpan dan bukan pendaftaran resmi.
        </div>
      )}
      {!open && !demo && (
        <div className="notice danger">
          Pendaftaran di luar periode aktif atau sedang ditutup.
        </div>
      )}
      <div className="wizard-steps">
        {steps.map((s, i) => (
          <div
            key={s}
            className={`wizard-step ${i <= step ? "active" : ""}`}
            aria-current={i === step ? "step" : undefined}
          >
            <span>0{i + 1}</span>
            {s}
          </div>
        ))}
      </div>
      <Progress
        value={(step + 1) * 25}
        aria-label="Kemajuan formulir"
        className="h-1 mb-6"
      />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (step < 3) next();
          else void send();
        }}
      >
        <div className="form-grid">
          {step === 0 && (
            <>
              {field(
                "student_name",
                "Nama lengkap siswa",
                "text",
                "Sesuai akta kelahiran",
                true,
              )}
              {field("nisn", "NISN", "text", "10 digit NISN")}
              {field("birth_date", "Tanggal lahir", "date")}
              <label className="field">
                Jenis kelamin
                <Select
                  value={values.gender}
                  onValueChange={(v) => setValues({ ...values, gender: v })}
                >
                  <SelectTrigger className="w-full h-[45px]">
                    <SelectValue placeholder="Pilih jenis kelamin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                    <SelectItem value="Perempuan">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </label>
              {field(
                "previous_school",
                "Asal sekolah",
                "text",
                "Nama SMP / MTs",
              )}
            </>
          )}
          {step === 1 && (
            <>
              {field(
                "parent_name",
                "Nama orang tua / wali",
                "text",
                "Nama lengkap wali",
                true,
              )}
              {field(
                "parent_phone",
                "Nomor telepon / WhatsApp",
                "tel",
                "08xxxxxxxxxx",
              )}
              {field("email", "Email aktif", "email", "nama@email.com")}
              {field(
                "address",
                "Alamat lengkap",
                "text",
                "Jalan, kelurahan, kecamatan, kota",
                true,
              )}
            </>
          )}
          {step === 2 &&
            (["report", "birth"] as const).map((key) => (
              <label className="field upload-box" key={key}>
                <Upload size={25} />
                <strong>
                  {key === "report" ? "Scan rapor" : "Akta kelahiran"}
                </strong>
                <small>PDF, JPG, PNG · Maksimal 5 MB</small>
                <input
                  aria-label={
                    key === "report" ? "Unggah rapor" : "Unggah akta kelahiran"
                  }
                  type="file"
                  accept="application/pdf,image/jpeg,image/png"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    const err = documentError(f);
                    if (err) {
                      setFiles({ ...files, [key]: undefined });
                      setError(err);
                      e.target.value = "";
                      return;
                    }
                    setError("");
                    setFiles({ ...files, [key]: f });
                  }}
                />
                {files[key] && <small>{files[key]?.name} ✓</small>}
              </label>
            ))}
          {step === 3 && (
            <>
              <div className="full">
                <h3>Periksa kembali data Anda</h3>
                <dl className="detail-list" style={{ marginTop: 20 }}>
                  {[
                    ["Nama siswa", values.student_name],
                    ["NISN", values.nisn],
                    ["Asal sekolah", values.previous_school],
                    ["Orang tua / wali", values.parent_name],
                    ["Email", values.email],
                    ["Nomor telepon", values.parent_phone],
                    ["Tanggal lahir", values.birth_date],
                    ["Jenis kelamin", values.gender],
                    ["Alamat", values.address],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="divider" />
                <p className="small muted">
                  <FileCheck2
                    size={16}
                    style={{ display: "inline", marginRight: 7 }}
                  />
                  {files.report?.name}
                  <br />
                  {files.birth?.name}
                </p>
              </div>
              <label className="check-line full">
                <Checkbox
                  checked={consent}
                  onCheckedChange={(v) => setConsent(v === true)}
                  aria-label="Persetujuan data"
                />
                <span>
                  Saya menyatakan data benar dan menyetujui penggunaan data
                  serta dokumen ini untuk proses penerimaan peserta didik baru.
                </span>
              </label>
            </>
          )}
          <label className="visually-hidden" aria-hidden="true">
            Website
            <input
              tabIndex={-1}
              autoComplete="off"
              value={values.website}
              onChange={(e) =>
                setValues({ ...values, website: e.target.value })
              }
            />
          </label>
        </div>
        {error && (
          <p role="alert" className="error-text" style={{ marginTop: 20 }}>
            {error}
          </p>
        )}
        <div className="form-actions">
          {step > 0 ? (
            <button
              className="button outline"
              type="button"
              onClick={() => {
                setStep(step - 1);
                setError("");
              }}
              disabled={busy}
            >
              <ArrowLeft size={16} /> Kembali
            </button>
          ) : (
            <span className="small muted">Langkah 1 dari 4</span>
          )}
          <button
            type="submit"
            className="button navy"
            disabled={busy || (!open && !demo)}
          >
            {busy ? (
              <>
                <LoaderCircle size={17} className="animate-spin" /> Mengirim…
              </>
            ) : step === 3 ? (
              demo ? (
                "Selesaikan simulasi"
              ) : (
                "Kirim pendaftaran"
              )
            ) : (
              <>
                Lanjutkan <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
