export const dynamic = "force-dynamic";
import { Brand } from "@/components/Brand";
import { LoginForm } from "@/components/admin/LoginForm";
import { configured } from "@/lib/supabase/server";
import Link from "next/link";
export const metadata = { title: "Masuk Pengelola" };
export default function Page() {
  return (
    <main id="main" className="login-wrap">
      <div className="panel login-card">
        <Brand />
        <h1>Selamat datang kembali.</h1>
        <p className="muted small" style={{ marginBottom: 25 }}>
          Masuk untuk mengelola informasi sekolah dan pendaftaran siswa.
        </p>
        <LoginForm demo={!configured()} />
        <Link href="/" className="text-link" style={{ marginTop: 25 }}>
          ← Kembali ke website
        </Link>
      </div>
    </main>
  );
}
