# ECOM · Katalog UMKM dan Studio 3D

ECOM adalah prototipe katalog untuk UMKM kreatif Indonesia. Pengunjung dapat menjelajahi koleksi furnitur, memeriksa material dan dimensi produk di studio 3D, lalu mencoba alur belanja.

| Area | Akses |
| --- | --- |
| Storefront | [https://e-ecom.vercel.app](https://e-ecom.vercel.app) |
| Dashboard admin demo | [/admin/demo](https://e-ecom.vercel.app/admin/demo) · tanpa login |
| Workspace dengan akun | [/login](https://e-ecom.vercel.app/login) · memerlukan backend yang sudah dikonfigurasi |

## Showcase CHAT 2026 · Banda Aceh

Proyek ini dikembangkan menggunakan **OpenCode** sebagai praktik *Hands-On Vibe Coding* pada **Creative Hub for App Talent (CHAT) 2026**, sesi Banda Aceh, 25 November 2026 di Aula Museum Aceh. Program CHAT diselenggarakan oleh **Direktorat Aplikasi, Kementerian Ekonomi Kreatif/Badan Ekonomi Kreatif Republik Indonesia**. [Pengumuman resmi program](https://ekraf.go.id/berita/kementerian-ekraf-cetak-talenta-aplikasi-daerah-lewat-peluncuran-program)

## Dashboard demo

Buka `/admin/demo` untuk mencoba ringkasan bisnis, pengelolaan produk, status pesanan, dan perubahan peran pengguna. Dashboard menggunakan data contoh dan menyimpan perubahan selama halaman dashboard terbuka. Muat ulang halaman atau gunakan tombol reset untuk memulihkan data contoh.

## Teknologi

React 19, TypeScript, Vite, Three.js, React Three Fiber, Drei, GSAP, Zustand, dan React Router. Backend opsional menggunakan Vercel Functions.

## Menjalankan

Butuh Node.js 20+.

```bash
npm install
npm run assets:fetch   # unduh model kasur CC0 (sekali saja, ±5 MB)
npm run dev            # http://localhost:5173
```

`npm run dev` menjalankan storefront Vite saja. Untuk mencoba API/auth lokal, siapkan `.env.local` dari `.env.example` dan jalankan `npx vercel dev` (Vercel CLI); URL lokalnya ditampilkan oleh CLI.

Perintah lain:

```bash
npm run build     # type-check + production build
npm run preview   # preview hasil build
npm test          # 8 unit test (catalog + cart/order logic)
npm run check     # type-check + test + production build
```

`npm run assets:fetch` bersifat opsional — tanpa model GLB, hero dan product page tetap berjalan memakai kasur prosedural bawaan.

## Yang bisa dicoba

**Storefront**

- Landing editorial dengan hero 3D real-time, marquee, value strip, dan kurasi produk.
- Katalog dengan pencarian, filter kategori (Sleep / Living / Craft), sorting, dan empty state.
- 11 produk contoh dengan ilustrasi line-art khusus per produk.
- Halaman detail: pemilihan ukuran kasur, stok demo, add to bag, spec list.
- Keranjang: ubah qty, hapus item, progress gratis pengiriman (demo), rekomendasi "Complete the room".
- Checkout simulasi: validasi form, pilihan metode pembayaran (transfer / QRIS / COD), order ID.
- Newsletter demo di footer (tidak mengirim email).

**Product studio (`/studio/rest`)**

- Lima mode inspeksi: Inspect, Exploded view, X-ray, Dimensions, Materials.
- Exploded slider 0–100%, pemilihan komponen, detail tiap lapisan.
- Diagram konstruksi proporsional + comfort profile (ilustratif).
- Ganti warna tekstil, ganti ukuran (Single / Double / Queen / King), product passport.
- Interaksi khusus: klik lampu untuk menyalakan, klik pintu lemari untuk membuka.
- Kamera responsif: framing otomatis menyesuaikan lebar layar.
- Mobile GPU path: adaptive DPR, reduced shadow resolution, bounded contact-shadow frames, touch-optimized orbit controls.

**PWA**

- Installable di Android/iOS melalui web app manifest dan ikon maskable.
- Service worker menyimpan app shell, thumbnail, logo, serta model GLB untuk kunjungan berikutnya.
- Navigasi memakai network-first dengan fallback offline; aset statis memakai cache-first + background refresh.
- Service worker mengambil versi baru otomatis setelah deployment.

**Merchant dashboard (`/admin`)**

- Overview: metrik, pipeline pesanan, peringatan low-stock, pesanan terbaru.
- CRUD produk (create / edit / delete) dengan pencarian.
- Manajemen status pesanan; stok varian kasur berkurang saat pesanan di-*confirm*.
- Reset seluruh data demo.

## Struktur

```
src/data/catalog.ts    data produk, varian ukuran, harga, format IDR
src/store/shop.ts      state commerce + persist localStorage
src/scenes/Scene.tsx   showroom 3D, kasur 5 lapisan, pegas instanced, lampu, lemari
src/App.tsx            storefront, studio, cart, checkout, about, dashboard
src/styles.css         sistem visual editorial + komponen + responsive
public/models/         GLB kasur (diunduh via npm run assets:fetch)
public/favicon.svg     monogram ECOM
tests/                 unit test katalog dan alur keranjang/pesanan
```

## Backend demo

Autentikasi dan pesanan demo memakai API serverless Vercel (`/api/*`) dan file `db.json` di private GitHub repository. API mengakses GitHub dengan token server-side; password disimpan sebagai hash scrypt, session memakai cookie HttpOnly bertanda tangan, dan role aktif dibaca ulang dari database pada setiap endpoint terlindungi.

Untuk menyiapkan database, buat private repository khusus, lalu jalankan seeding dari lingkungan lokal yang sudah login ke GitHub CLI:

```bash
DB_REPO=OWNER/PRIVATE_REPO npm run db:seed
```

Perintah ini membuat akun demo acak dan menulis kredensial ke `accounts.local.txt` (file lokal yang diabaikan Git). Simpan file tersebut dengan aman dan hapus setelah kredensial dicatat. Tambahkan environment variables berikut di Vercel untuk Production/Preview, lalu redeploy:

- `DB_REPO_OWNER` dan `DB_REPO_NAME`: pemilik dan nama private repository.
- `DB_GITHUB_TOKEN`: GitHub token dengan akses contents ke repository privat saja.
- `SESSION_SECRET`: nilai acak rahasia minimal 32 karakter.

Variabel ini harus server-side; jangan gunakan prefix `VITE_`. `.env.example` hanya daftar nama, bukan file rahasia.

## Batasan (penting)

- **Semua produk, harga, stok, dan klaim bersifat ilustratif.** Tidak ada sertifikasi, garansi, atau provenans manufaktur yang terverifikasi.
- Checkout **simulasi**: tidak ada pembayaran, pengiriman, pajak, atau email transaksional.
- Katalog produk, akun, dan pesanan disimpan di file JSON private GitHub untuk demo; keranjang tetap di `localStorage`. Ini bukan database transaksional.
- GitHub Contents API bukan penyimpanan transaksi: pembaruan beruntun, inventori serentak, dan skala produksi memerlukan database transaksional.
- Model GLB adalah furnitur ilustratif (CC0, Innerscene), bukan spesifikasi pabrikan. Studio kasur memakai model konstruksi internal tersendiri; keduanya bukan satu model yang saling terverifikasi.
- Produk non-kasur memakai ilustrasi vektor, bukan foto produk berlisensi.
- Logo resmi ECOM-Black.png / ECOM-White.png belum tersedia; header memakai wordmark teks dengan fallback otomatis.
- Belum ada upload gambar/GLB, payment gateway, atau transaksi inventori yang durable.

## Sebelum dipakai untuk penjualan nyata

1. Database transaksional dengan operasi order dan inventori atomik.
2. Isolasi merchant per toko dan audit keamanan sebelum dipakai untuk data nyata.
3. Storage tervalidasi untuk foto produk dan model 3D (kuota + signed URL).
4. Verifikasi pemasok, sertifikasi, dan isi product passport.
5. Foto produk berlisensi, logo resmi, serta QA browser/perangkat nyata.
6. Audit performa (model 3D ±5 MB, code-splitting scene sudah dilakukan).

## Deploy demo

Build ini siap untuk static showcase deployment:

```bash
npm run check
npm run build
```

- **Vercel:** import repositori ini; `api/` berisi serverless functions, sementara `vercel.json` menangani SPA rewrite dan security/cache headers. Set semua server-side secrets sebelum deploy.
- **Netlify:** publish directory `dist`; `public/_redirects` sudah menangani client-side routes.
- **Server sendiri:** serve folder `dist` dan fallback seluruh route yang tidak ditemukan ke `index.html`.

Gunakan HTTPS. Jangan masukkan credential produksi ke variabel `VITE_*`, karena seluruh nilai tersebut dapat dibaca dari browser.

## Aset 3D

Model: **Low platform bed 160 × 200, oak** — Innerscene 3D Parts Library, lisensi CC0. Detail dan atribusi ada di [`ASSETS.md`](./ASSETS.md).

## Environment

Pengembangan terakhir diuji dengan Node.js 24, npm 11, Vite 6, dan Chromium headless (desktop 1440×900 + mobile 390×844).
