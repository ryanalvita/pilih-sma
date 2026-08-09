# PilihSMA

Data hasil SNBP dari SMA di Indonesia (2024-2026), dikumpulkan manual dari pengumuman
Instagram tiap sekolah dan sumber publik lain. Cakupan saat ini baru Kota Bandung — lihat
"Kenapa situs ini dibuat?" di `/about` untuk ceritanya — dan akan diperluas ke kota lain.

Dibangun di atas [Astro Base](https://github.com/jonnysmillie/astro-base) (Astro + Tailwind v4 +
astro-icon + sitemap), jadi sudah dapat: SEO meta tags lengkap, aksesibilitas dasar (skip link,
focus states, aria labels), mobile nav, dan build production yang teroptimasi.

## Struktur

- `raw_data.tsv` - data mentah, format lebar (satu baris = satu sekolah+tahun, kolom = tiap universitas).
  Ini "source of truth" yang kamu edit manual (mis. lewat Google Sheets, export sebagai TSV).
- `parse.py` - mengubah `raw_data.tsv` menjadi `src/data/snbp.json` (format ternormalisasi, dipakai situs).
- `src/data/index.ts` - helper TypeScript untuk membaca data di halaman Astro.
- `src/pages/index.astro` - daftar semua sekolah, bisa dicari.
- `src/pages/schools/[slug].astro` - halaman detail per sekolah.
- `src/pages/submit.astro` + `src/components/SubmitDataForm.astro` - formulir kontribusi data (pakai Web3Forms, gratis).
- `src/pages/about.astro` - metodologi & catatan soal keterbatasan data.
- `src/components/Header.astro`, `Footer.astro` - dari template, sudah disesuaikan.

## Update data

1. Edit `raw_data.tsv` (atau edit di Google Sheets lalu export/paste ulang ke file ini - kolom harus tetap sama).
2. Jalankan `python3 parse.py` untuk regenerasi `src/data/snbp.json`.
3. `npm run dev` untuk cek lokal, lalu commit & push - kalau sudah terhubung ke Vercel/Netlify, situs auto-redeploy.

## Aktifkan formulir "Kontribusi Data"

Formulir submit pakai [Web3Forms](https://web3forms.com) (gratis, sampai 250 kiriman/bulan, tanpa server
sendiri). Cara aktifkan:

1. Daftar gratis di web3forms.com, ambil access key-nya.
2. Isi `web3formsAccessKey` di `src/config/site.mjs`.
3. Setiap kiriman akan masuk ke email kamu. Tinjau, lalu salin data yang sudah diverifikasi ke
   `raw_data.tsv` dan jalankan `parse.py` lagi.

Sampai key-nya diisi, halaman `/submit` akan menampilkan peringatan bahwa formulir belum aktif -
jadi aman untuk deploy duluan sebelum kamu sempat setup Web3Forms.

## Development

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # build ke dist/
npm run preview   # preview hasil build
```

## Deploy

Situs ini di-deploy ke **GitHub Pages** lewat GitHub Actions
(`.github/workflows/deploy.yml`), sama seperti `bank-statement-parser`.

1. Setiap `git push` ke `main` otomatis men-trigger workflow: build situs (`withastro/action`)
   lalu deploy ke GitHub Pages (`actions/deploy-pages`).
2. Di GitHub repo settings -> Pages, "Source" harus di-set ke **GitHub Actions** (bukan
   "Deploy from a branch").
3. **Sementara tanpa custom domain**: kolom "Custom domain" di Pages settings dikosongkan,
   jadi situsnya nempel di URL akun (`https://ryanalvita.com/pilih-sma/`, karena akun ini
   sudah punya domain apex `ryanalvita.com` terpasang di GitHub Pages-nya) — bukan
   `https://ryanalvita.github.io/pilih-sma/`. `src/config/site.mjs` (`url` + `base`) dan
   `astro.config.mjs` (`base: SITE.base`) sudah disesuaikan untuk path `/pilih-sma/` ini,
   supaya semua asset/link nggak patah.
4. Kalau nanti mau pindah ke domain sendiri (mis. `pilihsma.ryanalvita.com`): tambahkan
   CNAME record di DNS ke `ryanalvita.github.io`, isi custom domain di Pages settings,
   tambahkan lagi `public/CNAME`, lalu ubah `url` ke domain itu dan `base` jadi `"/"`
   di `src/config/site.mjs`.
