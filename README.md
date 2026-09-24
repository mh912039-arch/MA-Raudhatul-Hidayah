# Website Profil Sekolah & PPDB Digital

Implementasi PRD: Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS, Zod, Supabase Auth/PostgreSQL/Storage. Tema navy, bahasa Indonesia, responsif. Nama SMA Cakrawala, foto, alamat, artikel, dan identitas kepala sekolah adalah contoh, bukan identitas sekolah resmi.

## Jalankan di komputer

Butuh Node.js 22.13+ dan pnpm (versi tercantum pada package.json).

```bash
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev:next
```

Windows PowerShell: gunakan `Copy-Item .env.example .env.local` menggantikan `cp` bila diperlukan. Buka http://localhost:3000.

Tanpa konfigurasi Supabase, halaman publik memakai data contoh, PPDB menjadi simulasi yang tidak menyimpan dokumen, dan `/demo` menyediakan panel contoh. `/admin` selalu memerlukan autentikasi nyata; demo tidak membuka akses database.

Pada ZIP GitHub, `pnpm dev`, `pnpm build`, dan `pnpm start` juga menggunakan Next.js native. Checkout pratinjau memiliki adapter Vinext untuk hosting Sites, sedangkan `*:next` selalu menjalankan Next.js 16 asli.

## Aktifkan database dan akun pengelola

1. Buat proyek Supabase milik sekolah. Jalankan `supabase/schema.sql` **sekali** di SQL Editor proyek baru. Skrip tidak dimaksudkan untuk ditimpa ke proyek aplikasi lain.
2. Isi `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`: Project URL.
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: publishable key (anon legacy juga didukung).
   - `SUPABASE_SERVICE_ROLE_KEY`: service role/secret server key. Jangan pernah awali variabel ini dengan `NEXT_PUBLIC_`.
3. Di Supabase Authentication, buat akun staf dengan email dan password. Nonaktifkan pendaftaran akun publik bila tidak diperlukan. Salin UUID akun.
4. Jalankan SQL berikut untuk akun pertama; ganti UUID dan nama:

```sql
insert into public.profiles(id,name,role)
values ('UUID-AKUN-DARI-AUTH','Nama Pengelola','super_admin');
```

5. Restart aplikasi, buka `/login`, lalu masuk dengan akun tadi.
6. Melalui **Pengaturan**, ganti nama, profil, sambutan, visi/misi, kontak, Google Maps, tahun ajaran, dan tanggal PPDB. Foto kepala sekolah harus WebP ≤500 KB.
7. Isi konten berita dan galeri. Aktifkan tombol **Buka pendaftaran** hanya setelah konfigurasi selesai. Seed database menutup PPDB secara default.
8. Buat akun staf lain dengan role `admin` atau `humas` melalui SQL terkontrol. Tidak ada fitur peningkatan role mandiri di browser.

| Peran | Berita, pengumuman, galeri | Pendaftar & berkas | Profil & pengaturan |
|---|---|---|---|
| Humas | CRUD | Tidak | Tidak |
| Admin | CRUD | Lihat & verifikasi | Tidak |
| Super Admin | CRUD | Lihat & verifikasi | Ubah |

## Fitur

- Beranda: hero, nilai sekolah, sambutan, berita, galeri, pengumuman tersemat, dan tautan PPDB.
- Profil: tentang sekolah, sambutan, visi/misi, struktur organisasi responsif.
- Berita: kategori, pencarian, halaman artikel, pengumuman.
- Galeri: kategori dan pembesaran gambar.
- Kontak: peta Google responsif, alamat teks tetap tersedia, tautan arah.
- PPDB: empat tahap, validasi client/server, rapor dan akta PDF/PNG/JPG ≤5 MB per berkas, pemeriksaan signature, persetujuan, bukti cetak.
- Registrasi: nomor `PPDB-TAHUN-NOMORURUT` dibuat database secara atomik; NISN unik per tahun ajaran; idempotency mencegah duplikasi saat retry.
- Status: nomor registrasi + kode akses acak 256 bit. Database menyimpan hash kode, bukan kode mentah.
- Admin: sidebar bisa dilipat, filter/pencarian pendaftar, tautan berkas privat 2 menit, status/catatan, log audit, pemeriksaan konflik perubahan bersamaan.
- CMS: draf/terbit, pin, CRUD berita/pengumuman/galeri, unggah gambar.
- Baca-saja: mode pemeliharaan menghentikan pendaftaran, verifikasi, dan perubahan konten; super admin tetap bisa memulihkan pengaturan.

## GitHub

Panduan lengkap: `docs/GITHUB.md`. ZIP berisi **source code**, bukan hanya hasil build. Ekstrak ZIP lalu unggah **isi folder proyek**, termasuk folder `app`, `components`, `lib`, `supabase`, `public`, `.github`, dan file konfigurasi.

Jangan unggah `.env.local`, `node_modules`, `.next`, data siswa, atau dokumen pendaftar. `.gitignore` sudah disediakan.

## Produksi

```bash
pnpm build:next
pnpm start:next
```

Atau `docker compose up --build -d` setelah `.env.local` diisi. Docker multi-stage menggunakan user non-root. Untuk VPS/Coolify, arahkan domain HTTPS ke port 3000; set batas body reverse proxy minimal 12 MB (misalnya nginx `client_max_body_size 12m;`). Konfigurasi dipasok melalui environment runtime, bukan hardcode. Supabase tetap layanan eksternal.

Vercel: import repository GitHub, pilih Next.js, pasang ketiga environment variables, gunakan `pnpm build:next`. Situs dengan Server Actions **tidak dapat dijalankan hanya melalui GitHub Pages**.

## Pengujian

```bash
pnpm typecheck
pnpm test
pnpm exec playwright install chromium
pnpm test:e2e
```

- Validasi: data siswa, NISN, tanggal, format/ukuran/signature file, URL peta, catatan verifikasi.
- PostgreSQL lokal (PGlite): schema, RLS, pemisahan role, pencegahan eskalasi, audit, konflik pembaruan, periode, nomor unik, rate limit, maintenance.
- Playwright: alur PPDB simulasi, berita, galeri, CMS demo, verifikasi demo, redirect admin, desktop dan mobile. Jalankan dengan environment Supabase kosong agar data uji tidak masuk produksi.
- CI GitHub menjalankan pengecekan, build, dan E2E dengan konfigurasi demo.

Laporan validasi aktual: `docs/VALIDATION.md`. Pengujian layanan Supabase nyata dan performa produksi tetap memerlukan proyek, akun, serta domain sekolah.

## Struktur

```text
app/(marketing)/     Halaman publik; Server Components
app/admin/           Area pengelola dengan guard server
app/demo/            Demonstrasi terisolasi tanpa database
app/actions/         Server Actions dengan Zod dan pemeriksaan role
app/api/content/     API konten terautentikasi dan pemeriksaan origin
components/          Komponen UI, sekolah, PPDB, admin
lib/                 Data, auth, schema, client Supabase server
supabase/schema.sql  Struktur PostgreSQL, RLS, bucket, trigger, RPC
public/images/       Foto WebP ilustratif
proxy.ts             Refresh session Next.js 16
Dockerfile           Build produksi multi-stage
```

Batas MVP: tidak ada pembayaran, LMS, aplikasi native, atau live chat. Status “Perlu revisi” menampilkan catatan; tindak lanjut berkas dilakukan melalui petugas sekolah. Email/WhatsApp notifikasi otomatis tidak termasuk MVP. Struktur organisasi menggunakan jabatan standar; ubah komponen `ProfileTabs.tsx` bila struktur sekolah berbeda.

Untuk operasi nyata, uji unggah/akses berkas dengan akun admin, humas, dan pengguna tanpa role; pastikan backup/retensi dokumen, SMTP autentikasi, serta pengaturan HTTPS sesuai kebijakan sekolah. `docs/OPERATIONS.md` menjelaskan tindak lanjut teknis.
