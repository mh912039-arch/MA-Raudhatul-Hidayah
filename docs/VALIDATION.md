# Hasil validasi — 24 September 2026

## Lulus

- Build produksi Next.js 16 native: seluruh 19 route berhasil dibangun; area publik/dinamis, admin, login, dan Server Actions tersedia.
- Build adapter hosting: output ESM Worker memiliki ekspor default dengan fungsi `fetch`.
- TypeScript strict: diperiksa melalui `tsc --noEmit`; generator tipe route Next dijalankan sebelum pengecekan karena adapter preview juga menghasilkan tipe route.
- Tiga kelompok tes validasi Zod/berkas: data valid dan tidak valid, NISN, tanggal, persetujuan, honeypot, signature dan ukuran berkas, URL Maps, catatan penolakan.
- Satu rangkaian tes PostgreSQL lokal via PGlite: schema dapat diterapkan; RLS menolak akses anon/humas ke pendaftar; role tidak dapat dinaikkan oleh pengguna; draf tersembunyi dari publik; log verifikasi atomik dan tidak dapat dihapus; konflik pembaruan ditolak; nomor registrasi unik; NISN duplikat ditolak; batas percobaan, maintenance, dan periode PPDB diberlakukan.
- Uji browser pratinjau: beranda, validasi form kosong, pengisian data siswa/wali, pemilihan jenis kelamin, unggah dua PDF contoh, halaman konfirmasi, pengiriman Server Action, bukti simulasi, pencarian status, pembuatan berita contoh, dan verifikasi pendaftar contoh.
- Suite Playwright desktop/mobile disertakan dan dikenali runner: 8 skenario. CI sudah disediakan.

## Batas pemeriksaan

- PGlite menggunakan schema auth/storage tiruan untuk memeriksa logika PostgreSQL; bukan koneksi Supabase produksi.
- Belum ada kredensial Supabase sekolah. Login akun nyata, upload ke Storage nyata, signed URL nyata, dan publikasi CMS produksi belum diuji terhadap layanan sekolah.
- Suite Playwright lokal lengkap belum dieksekusi dalam lingkungan ini; alur browser inti diuji melalui browser pratinjau. Jalankan `pnpm test:e2e` setelah ekstraksi, serta uji integrasi staging terpisah.
- Dockerfile dan docker-compose disediakan; container Docker/VPS/Coolify belum dijalankan karena target server tidak diberikan.
- Tidak mengklaim skor Lighthouse, FCP, latensi API, persentase keberhasilan pendaftaran, atau evaluasi pascapeluncuran.
- WebMCP status helper disertakan dengan feature detection. Browser pratinjau tidak menyediakan `document.modelContext`, sehingga validasi pemanggilan WebMCP tidak tersedia; UI status tetap menggunakan Server Action yang sama.
