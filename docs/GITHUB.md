# Unggah proyek ke GitHub

## Cara paling mudah: GitHub Desktop

1. Ekstrak `Website_Sekolah_PPDB_GitHub.zip`.
2. Instal GitHub Desktop dari https://desktop.github.com/ dan masuk ke akun Anda.
3. Pilih **File → New repository**. Nama contoh: `website-sekolah-ppdb`.
4. Salin seluruh isi folder hasil ekstrak ke folder repository yang dibuat.
5. Pastikan `.env.local`, `node_modules`, dan `.next` tidak ada dalam daftar perubahan.
6. Isi ringkasan commit, misalnya `Website profil sekolah dan PPDB`.
7. Klik **Commit to main**, lalu **Publish repository**. Pilih private atau public sesuai kebutuhan sekolah.

## Alternatif: Git melalui terminal

Buka terminal di folder hasil ekstrak:

```bash
git init
git add .
git commit -m "Initial school profile and PPDB application"
git branch -M main
git remote add origin https://github.com/USERNAME/website-sekolah-ppdb.git
git push -u origin main
```

Ganti `USERNAME` dan nama repository. Buat repository kosong terlebih dahulu di GitHub. Autentikasi dilakukan melalui GitHub Desktop, Git Credential Manager, atau SSH milik Anda. Jangan menaruh token dalam file proyek atau URL yang dibagikan.

## Alternatif: unggah melalui web GitHub

Buat repository → **Add file → Upload files** → seret **isi folder hasil ekstrak**, bukan file ZIP saja → **Commit changes**. Pastikan file tersembunyi `.gitignore`, `.env.example`, `.dockerignore`, dan folder `.github` ikut diunggah. Gunakan GitHub Desktop bila batas jumlah file pada browser menghambat.

## Menjalankan repository

```bash
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

Windows: `Copy-Item .env.example .env.local`.

Isi koneksi Supabase sesuai README untuk mengaktifkan pendaftaran sungguhan. Kode sumber tidak menyertakan password admin default.

## Menerbitkan website

GitHub menyimpan source code. Gunakan Vercel, VPS, atau Coolify untuk menjalankan Next.js dengan fitur server. Import repository ke Vercel lalu isi environment variables; build command `pnpm build:next`. Untuk VPS/Coolify, tersedia Dockerfile dan docker-compose.yml.
