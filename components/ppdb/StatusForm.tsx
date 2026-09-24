"use client";
import { useStatusTool } from "./StatusWebMCP";
import { useState } from "react";
import { checkStatus } from "@/app/actions/ppdb";
export function StatusForm({ demo }: { demo: boolean }) {
  const [number, setNumber] = useState("");
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Awaited<
    ReturnType<typeof checkStatus>
  > | null>(null);
  useStatusTool(setNumber, setToken, setResult);
  return (
    <div className="panel stack" style={{ maxWidth: 620, margin: "0 auto" }}>
      <h2>Pantau pendaftaranmu.</h2>
      <p>Gunakan nomor registrasi dan kode akses pada bukti pendaftaran.</p>
      {demo && (
        <div className="notice">
          Contoh simulasi: nomor <strong>SIMULASI-PPDB-2027</strong>, kode akses{" "}
          <strong>DEMO</strong>.
        </div>
      )}
      <form
        className="stack"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            setResult(
              await checkStatus({
                registration_number: number,
                access_token: token,
              }),
            );
          } catch {
            setResult({ error: "Koneksi terputus. Coba kembali." });
          } finally {
            setBusy(false);
          }
        }}
      >
        <label className="field">
          Nomor registrasi
          <input
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            required
            maxLength={40}
            placeholder="PPDB-2027-000001"
          />
        </label>
        <label className="field">
          Kode akses pribadi
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            type="password"
            required
            maxLength={64}
            placeholder="Kode akses pada bukti pendaftaran"
          />
        </label>
        <button className="button navy" disabled={busy}>
          {busy ? "Memeriksa…" : "Cek status pendaftaran"}
        </button>
      </form>
      {result?.error && (
        <div className="notice danger" role="alert">
          {result.error}
        </div>
      )}
      {result && "data" in result && result.data && (
        <div className="panel stack">
          <span
            className={`badge ${result.data.status === "Diterima" ? "accepted" : result.data.status === "Ditolak" ? "rejected" : "waiting"}`}
          >
            {result.data.status}
          </span>
          <h3>{result.data.student_name}</h3>
          <p>{result.data.registration_number}</p>
          <p>
            {result.data.notes ||
              "Berkas Anda sedang menunggu pemeriksaan tim sekolah."}
          </p>
          {result.data.status === "Perlu revisi" && (
            <p>
              Hubungi sekolah dan sampaikan nomor registrasi untuk
              menindaklanjuti catatan revisi.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
