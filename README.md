# ECOM — Commerce, Reimagined

Prototype commerce experience untuk UMKM kreatif Indonesia: katalog produk + **studio 3D interaktif** yang memperlihatkan konstruksi, bahan, dan ukuran sebelum membeli.

Dibangun dengan React 19, TypeScript, Vite, Three.js / React Three Fiber / Drei, GSAP, Zustand, dan React Router.

## Menjalankan

Butuh Node.js 20+.

```bash
npm install
npm run assets:fetch   # unduh model kasur CC0 (sekali saja, ±5 MB)
npm run dev            # http://localhost:5173
```

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

## Batasan (penting)

- **Semua produk, harga, stok, dan klaim bersifat ilustratif.** Tidak ada sertifikasi, garansi, atau provenans manufaktur yang terverifikasi.
- Checkout **simulasi**: tidak ada pembayaran, pengiriman, pajak, atau email transaksional.
- Data disimpan di **localStorage browser** — bukan backend, bukan autentikasi, dan tidak aman untuk produksi.
- Model GLB adalah furnitur ilustratif (CC0, Innerscene), bukan spesifikasi pabrikan. Studio kasur memakai model konstruksi internal tersendiri; keduanya bukan satu model yang saling terverifikasi.
- Produk non-kasur memakai ilustrasi vektor, bukan foto produk berlisensi.
- Logo resmi ECOM-Black.png / ECOM-White.png belum tersedia; header memakai wordmark teks dengan fallback otomatis.
- Belum ada upload gambar/GLB, Supabase, auth merchant, RLS, atau transaksi inventori yang durable.

## Sebelum dipakai untuk penjualan nyata

1. Backend + database (Supabase/Postgres) dengan RPC order transaksional.
2. Autentikasi merchant dan Row Level Security per toko.
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

- **Vercel:** import folder ini; `vercel.json` sudah menangani SPA rewrite dan security/cache headers.
- **Netlify:** publish directory `dist`; `public/_redirects` sudah menangani client-side routes.
- **Server sendiri:** serve folder `dist` dan fallback seluruh route yang tidak ditemukan ke `index.html`.

Gunakan HTTPS. Jangan masukkan credential produksi ke variabel `VITE_*`, karena seluruh nilai tersebut dapat dibaca dari browser.

## Aset 3D

Model: **Low platform bed 160 × 200, oak** — Innerscene 3D Parts Library, lisensi CC0. Detail dan atribusi ada di [`ASSETS.md`](./ASSETS.md).

## Environment

Pengembangan terakhir diuji dengan Node.js 24, npm 11, Vite 6, dan Chromium headless (desktop 1440×900 + mobile 390×844).
