"use client";
import { useState } from "react";
import { login } from "@/app/actions/auth";
import Link from "next/link";
export function LoginForm({ demo }: { demo: boolean }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <>
      <form
        className="stack"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          const f = new FormData(e.currentTarget);
          try {
            const r = await login(Object.fromEntries(f));
            if (r?.error) setError(r.error);
          } finally {
            setBusy(false);
          }
        }}
      >
        <label className="field">
          Email pengelola
          <input
            name="email"
            type="email"
            autoComplete="username"
            placeholder="admin@sekolah.sch.id"
            required
          />
        </label>
        <label className="field">
          Kata sandi
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            minLength={8}
            required
          />
        </label>
        {error && (
          <p className="error-text" role="alert">
            {error}
          </p>
        )}
        <button className="button navy" disabled={busy || demo}>
          {busy ? "Memeriksa akun…" : "Masuk ke panel"}
        </button>
      </form>
      {demo && (
        <div className="stack" style={{ marginTop: 20 }}>
          <div className="notice">
            Akun pengelola tersedia setelah Supabase dikonfigurasi. Jelajahi
            panel dengan data contoh.
          </div>
          <Link className="button outline" href="/demo">
            Lihat demo panel pengelola →
          </Link>
        </div>
      )}
    </>
  );
}
