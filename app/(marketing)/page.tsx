import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Compass,
  Heart,
  GraduationCap,
  Megaphone,
  CalendarDays,
  ShieldCheck,
} from "lucide-react";
import {
  getSchool,
  getPosts,
  getAnnouncements,
  getGallery,
  isOpen,
  dateID,
} from "@/lib/data";
export default async function Home() {
  const [{ school }, posts, announcements, gallery] = await Promise.all([
    getSchool(),
    getPosts(),
    getAnnouncements(),
    getGallery(),
  ]);
  const open = isOpen(school);
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow">
              <span />
              SELAMAT DATANG DI {school.name.toUpperCase()}
            </div>
            <h1>
              Ruang bertumbuh.
              <br />
              Bekal <em>masa depan.</em>
            </h1>
            <p>
              Pendidikan yang menumbuhkan karakter, membuka wawasan, dan memberi
              ruang bagi setiap potensi.
            </p>
            <div className="hero-actions">
              <Link className="button navy" href="/ppdb">
                Mulai perjalananmu <ArrowUpRight size={18} />
              </Link>
              <Link className="text-link" href="/profil">
                Kenali sekolah kami <ArrowRight size={17} />
              </Link>
            </div>
            <div className="hero-values">
              <span>
                <ShieldCheck size={17} /> Karakter yang kuat
              </span>
              <i />
              <span>
                <GraduationCap size={19} /> Belajar untuk kehidupan
              </span>
            </div>
          </div>
          <div className="hero-visual">
            <Image
              src="/images/campus.webp"
              alt="Ilustrasi lingkungan belajar sekolah yang hijau dan terbuka"
              fill
              priority
              sizes="(max-width: 800px) 100vw, 52vw"
              className="cover"
            />
            <div className="image-shade" />
            <div className="photo-label">
              <span className="tiny-line" />
              CERITA DIMULAI DI SINI
            </div>
            <div className="photo-caption">
              <span>
                Temukan potensimu.
                <br />
                Bentuk ceritamu sendiri.
              </span>
              <span className="round-arrow">
                <ArrowUpRight size={25} />
              </span>
            </div>
            <div className="admission-chip">
              <span className="chip-icon">
                <BookOpen size={21} />
              </span>
              <div>
                <small>TAHUN AJARAN {school.academic_year}</small>
                <strong>
                  {open
                    ? "Pendaftaran siswa baru dibuka"
                    : "Kenali program sekolah"}
                </strong>
              </div>
              <Link href="/ppdb" aria-label="Lihat informasi PPDB">
                <ArrowUpRight size={22} />
              </Link>
            </div>
          </div>
        </div>
      </section>
      <div className="announcement-strip">
        <div className="container announcement-inner">
          <span className="announcement-tag">
            <Megaphone size={17} /> PENGUMUMAN
          </span>
          <p>
            {announcements[0]?.title ??
              "Informasi sekolah terbaru tersedia di halaman berita."}
          </p>
          <Link href="/berita#pengumuman">
            Selengkapnya <ArrowRight size={16} />
          </Link>
        </div>
      </div>
      <section className="section container intro-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">LEBIH DARI SEKADAR SEKOLAH</div>
            <h2>
              Belajar hari ini.
              <br />
              <span>Memberi arti esok hari.</span>
            </h2>
          </div>
          <p>{school.intro}</p>
        </div>
        <div className="values-grid">
          {[
            {
              icon: BookOpen,
              n: "01",
              title: "Pembelajaran bermakna",
              desc: "Menghubungkan ilmu dengan kehidupan melalui eksplorasi, diskusi, dan pengalaman nyata.",
            },
            {
              icon: Heart,
              n: "02",
              title: "Karakter & kepedulian",
              desc: "Membangun integritas, empati, dan rasa tanggung jawab dalam setiap langkah.",
            },
            {
              icon: Compass,
              n: "03",
              title: "Ruang untuk potensi",
              desc: "Mendampingi minat dan bakat agar setiap siswa dapat menemukan jalannya sendiri.",
            },
          ].map((v) => (
            <article className="value-card" key={v.n}>
              <div className="value-top">
                <v.icon size={26} strokeWidth={1.5} />
                <span>{v.n}</span>
              </div>
              <h3>{v.title}</h3>
              <p>{v.desc}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="principal-band">
        <div className="container principal-inner">
          <span className="quote-mark">“</span>
          <div>
            <div className="eyebrow">DARI KEPALA SEKOLAH</div>
            <h2>
              Setiap anak layak mendapat ruang
              <br />
              untuk menjadi versi terbaik dirinya.
            </h2>
            <p>
              {school.principal_name}
              <span>Kepala {school.name}</span>
            </p>
          </div>
          <Link href="/profil?tab=sambutan" className="button outline">
            Baca sambutan <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>
      <section className="section container">
        <div className="section-heading">
          <div>
            <div className="eyebrow">CERITA DARI {school.short_name.toUpperCase()}</div>
            <h2>Kabar & kegiatan terbaru</h2>
          </div>
          <Link href="/berita" className="text-link">
            Semua berita <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="news-grid">
          {posts.slice(0, 3).map((p) => (
            <Link href={`/berita/${p.slug}`} className="news-card" key={p.id}>
              <div className="news-image">
                <Image
                  src={p.image || "/images/campus.webp"}
                  alt={p.title}
                  fill
                  sizes="(max-width: 700px) 100vw, 33vw"
                  className="cover"
                />
                <span>{p.category}</span>
              </div>
              <div className="news-meta">
                <CalendarDays size={14} />
                {dateID(p.created_at)}
              </div>
              <h3>{p.title}</h3>
              <span className="news-more">
                Baca cerita <ArrowUpRight size={16} />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="section container" style={{ paddingTop: 0 }}>
        <div className="section-heading">
          <div>
            <div className="eyebrow">KEHIDUPAN SEKOLAH</div>
            <h2>Momen kecil, cerita berarti.</h2>
          </div>
          <Link href="/galeri" className="text-link">
            Jelajahi galeri <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="news-grid">
          {gallery.slice(0, 3).map((g) => (
            <Link href="/galeri" key={g.id}>
              <div className="news-image">
                <Image
                  src={g.image}
                  alt={g.title}
                  fill
                  sizes="(max-width:700px) 100vw, 33vw"
                  className="cover"
                />
                <span>{g.title}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="container bottom-cta">
        <div>
          <div className="eyebrow">MASA DEPAN DIMULAI DARI SATU LANGKAH</div>
          <h2>Siap menjadi bagian dari {school.short_name}?</h2>
          <p>Kenali alur PPDB dan mulai perjalanan belajarmu bersama kami.</p>
        </div>
        <Link href="/ppdb" className="button gold">
          Jelajahi PPDB Online <ArrowUpRight size={18} />
        </Link>
      </section>
    </>
  );
}
