import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Brand } from "./Brand";
import type { School } from "@/lib/types";
export function Footer({ school, demo }: { school: School; demo: boolean }) {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <Brand name={school.name} light />
          <p>
            Tempat mengenal potensi.
            <br />
            Ruang merancang masa depan.
          </p>
        </div>
        <div>
          <h3>Jelajahi sekolah</h3>
          <Link href="/profil">Profil & visi misi</Link>
          <Link href="/berita">Berita & pengumuman</Link>
          <Link href="/galeri">Galeri sekolah</Link>
        </div>
        <div>
          <h3>Langkah berikutnya</h3>
          <Link href="/ppdb">
            Pendaftaran PPDB <ArrowUpRight size={14} />
          </Link>
          <Link href="/ppdb/status">Cek status pendaftaran</Link>
          <Link href="/kontak">Hubungi sekolah</Link>
        </div>
        <div>
          <h3>Kunjungi kami</h3>
          <p>{school.address}</p>
          <Link href="/admin">
            Panel pengelola <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>
          © {new Date().getUTCFullYear()} {school.name}.
        </span>
        <span>
          {demo
            ? "Situs demonstrasi · Identitas, foto, dan konten merupakan contoh."
            : school.tagline}
        </span>
      </div>
    </footer>
  );
}
