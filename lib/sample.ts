import type { School, Post, Announcement, GalleryItem } from "./types";
export const sampleSchool: School = {
  id: "main",
  name: "SMA Cakrawala",
  short_name: "Cakrawala",
  tagline: "Berkarakter. Berprestasi. Berdampak.",
  intro:
    "Setiap anak membawa potensi yang berbeda. Kami hadir untuk membantu mereka mengenali diri, berani mengeksplorasi, dan tumbuh menjadi pribadi yang memberi arti.",
  principal_name: "Dr. Arya Pratama, M.Pd.",
  principal_message:
    "Sekolah adalah tempat belajar tentang dunia sekaligus menemukan diri sendiri. Di Cakrawala, kami mendampingi setiap langkah siswa dengan pendidikan yang memadukan pengetahuan, karakter, dan kepedulian. Mari membangun masa depan melalui pengalaman belajar yang bermakna.",
  principal_image: "",
  vision:
    "Menjadi ruang tumbuh bagi generasi berkarakter, berwawasan global, dan peduli terhadap sesama.",
  mission: [
    "Membangun budaya belajar yang aktif, kritis, dan menyenangkan.",
    "Mengembangkan karakter melalui keteladanan dan kepedulian.",
    "Mendampingi minat dan bakat setiap peserta didik.",
    "Menghubungkan pembelajaran dengan kehidupan dan lingkungan.",
  ],
  phone: "",
  email: "",
  address: "Bandung, Jawa Barat — alamat contoh; ganti dengan alamat sekolah.",
  maps_url:
    "https://www.google.com/maps?q=Bandung%2C%20Jawa%20Barat&output=embed",
  academic_year: "2027/2028",
  ppdb_open: true,
  ppdb_start: "2026-09-01",
  ppdb_end: "2027-06-30",
  maintenance: false,
};
export const samplePosts: Post[] = [
  {
    id: "contoh-1",
    slug: "ruang-eksplorasi-sains",
    title: "Dari rasa ingin tahu, lahir ide-ide baru.",
    category: "Akademik",
    body: `Eksperimen sederhana membuka banyak pertanyaan. Dalam kegiatan eksplorasi sains, siswa belajar mengamati, menyusun hipotesis, dan mencoba menemukan jawabannya bersama.

Pendampingan guru membantu siswa menghubungkan konsep di kelas dengan hal-hal yang mereka temui sehari-hari. Proses belajar menjadi perjalanan yang aktif dan penuh penemuan.

Artikel ini adalah konten contoh untuk demonstrasi website.`,
    image: "/images/science.webp",
    published: true,
    pinned: false,
    created_at: "2026-09-18T08:00:00Z",
  },
  {
    id: "contoh-2",
    slug: "belajar-dan-bertumbuh-bersama",
    title: "Belajar lebih bermakna, bertumbuh bersama.",
    category: "Kegiatan",
    body: `Kolaborasi memberi ruang bagi setiap siswa untuk berbagi gagasan. Diskusi, kerja kelompok, dan refleksi menjadi bagian dari proses pembelajaran.

Melalui kegiatan ini, siswa melatih komunikasi, kerja sama, dan kemampuan menyelesaikan masalah.

Artikel ini adalah konten contoh untuk demonstrasi website.`,
    image: "/images/students.webp",
    published: true,
    pinned: false,
    created_at: "2026-09-15T08:00:00Z",
  },
  {
    id: "contoh-3",
    slug: "mengenal-lingkungan-sekolah",
    title: "Satu lingkungan, banyak kesempatan untuk tumbuh.",
    category: "Sekolah",
    body: `Lingkungan belajar yang nyaman mendukung siswa untuk mencoba hal baru dan membangun pertemanan.

Kenali ruang belajar serta kegiatan sekolah sebelum memulai perjalanan pendidikan berikutnya.

Artikel ini adalah konten contoh untuk demonstrasi website.`,
    image: "/images/campus.webp",
    published: true,
    pinned: false,
    created_at: "2026-09-10T08:00:00Z",
  },
];
export const sampleAnnouncements: Announcement[] = [
  {
    id: "contoh-pengumuman",
    title: "Penerimaan peserta didik baru tahun ajaran 2027/2028",
    body: "Kenali alur pendaftaran dan siapkan dokumen persyaratan. Periode pada situs demo hanya merupakan contoh.",
    pinned: true,
    created_at: "2026-09-20T08:00:00Z",
  },
];
export const sampleGallery: GalleryItem[] = [
  {
    id: "g1",
    title: "Lingkungan belajar",
    image: "/images/campus.webp",
    category: "Sekolah",
    created_at: "2026-09-20",
  },
  {
    id: "g2",
    title: "Kolaborasi di ruang kelas",
    image: "/images/students.webp",
    category: "Kegiatan",
    created_at: "2026-09-20",
  },
  {
    id: "g3",
    title: "Eksplorasi sains",
    image: "/images/science.webp",
    category: "Akademik",
    created_at: "2026-09-20",
  },
];
