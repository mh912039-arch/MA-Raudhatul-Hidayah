"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="section container">
      <div className="panel stack">
        <h1 style={{ fontSize: 32 }}>Halaman belum dapat dimuat.</h1>
        <p>Periksa koneksi lalu coba kembali.</p>
        <button className="button navy" onClick={reset}>
          Coba lagi
        </button>
      </div>
    </main>
  );
}
