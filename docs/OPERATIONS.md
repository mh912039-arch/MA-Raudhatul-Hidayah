# Catatan operasi

- Tabel `profiles` tidak bisa diedit pengguna biasa. Role diberikan/dicabut administrator melalui SQL terkontrol, bukan user_metadata. Pemeriksaan action memanggil Supabase getUser dan membaca role aktual.
- Semua tabel publik menggunakan RLS. Tabel rate limit berada pada schema private. Security-definer hanya dipakai untuk lookup role dan trigger internal; search_path dikunci dan eksekusi publik dicabut.
- Bucket `documents` privat, maksimum 5 MB, hanya dapat ditulis server. Bucket `media` publik hanya untuk foto website. Jangan memindahkan dokumen siswa ke `media`.
- Nomor urut adalah sequence global dengan prefix tahun ajaran, bukan counter yang direset. Nomor dapat memiliki celah akibat transaksi gagal; tetap unik dan monoton.
- Double-submit menggunakan request UUID dan access-token hash. Retry dalam halaman yang sama mengembalikan nomor sebelumnya. Jangan menutup halaman sebelum menyimpan bukti.
- Bila jaringan putus saat commit, hasil transaksi bisa belum diketahui. Aplikasi mempertahankan dokumen yang mungkin sudah dirujuk registrasi. Hapus orphan hanya setelah memeriksa referensi `report_path`/`birth_path`, umur file, dan memastikan tidak ada submit yang berlangsung. Jangan menghapus bucket secara massal.
- Rate limit 5 percobaan/jam untuk kombinasi hash email+NISN. Ini bukan proteksi DDoS global. Untuk publikasi berskala besar, pasang pembatasan trafik di reverse proxy dan monitor pemakaian Storage.
- Catatan verifikasi terlihat oleh pemegang kode akses. Jangan menaruh informasi internal staf dalam catatan publik.
- Data contoh tersedia hanya ketika URL/key Supabase kosong atau di `/demo`. Koneksi database yang gagal menampilkan pemeliharaan dan mematikan pendaftaran, bukan mengganti data nyata secara diam-diam.
- Baca-saja tidak menghapus akun atau data. Matikan melalui Pengaturan dengan akun super_admin setelah layanan pulih.
- Contoh foto bukan foto resmi sekolah; ganti aset sebelum peluncuran institusi nyata. Kredit pada ASSETS.md.
- Struktur backup, retensi berkas, pemulihan kode akses hilang, serta prosedur koreksi berkas oleh petugas perlu ditetapkan sekolah. Aplikasi tidak mengirim kode akses melalui email.
- Observabilitas tersedia melalui log Next/container dan Supabase Logs. Jangan mencatat NISN, akta, access token, atau secret key dalam log.
- Target PRD (FCP <1,2 detik, Lighthouse >90, API <1,5 detik, konversi >95%, evaluasi 14 hari) memerlukan pengukuran lingkungan produksi; bukan hasil yang diklaim pada paket ini.
