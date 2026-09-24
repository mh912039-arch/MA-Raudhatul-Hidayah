import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="section container">
      <div className="panel stack">
        <div className="eyebrow">404</div>
        <h1>Halaman tidak ditemukan.</h1>
        <p className="muted">Alamat halaman mungkin sudah berubah.</p>
        <Link className="button navy" href="/">
          Kembali ke beranda
        </Link>
      </div>
    </main>
  );
}
