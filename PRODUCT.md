# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Users

Staf gudang lapangan yang bekerja di area rak dan memakai HP untuk mencatat
pergerakan barang sambil berdiri. Mereka memindai barcode dan perlu
menyelesaikan pencatatan dengan cepat. Supervisor dan admin gudang belum
dikonfirmasi sebagai pengguna aplikasi ini. API menyediakan field `role`,
tetapi belum ada UI yang berbeda per peran.

## Product Purpose

Logisync mencatat barang masuk, barang keluar, dan opname stok per lokasi
gudang, lalu menyediakan riwayat transaksi untuk penelusuran. Aplikasi
menggantikan pencatatan manual di kertas atau spreadsheet dengan catatan
digital yang terikat ke lokasi, nomor referensi, dan pengguna yang mencatat.
Sukses berarti staf bisa menyelesaikan pencatatan tanpa kembali ke meja dan
stok fisik cocok dengan catatan sistem.

## Positioning

Satu alur mobile yang menyatukan transaksi dan audit. Setiap pergerakan barang
menyebut SKU, lokasi, dan nomor referensi, sementara opname berjalan per sesi
audit dengan hasil hitung per item. Aplikasi memakai API Logisync yang sama
dengan sistem gudang, bukan aplikasi terpisah dengan data sendiri.

## Operating Context

- Lingkungan gudang dengan rak dan label barcode barang.
- Perangkat utama HP, dengan target rilis Android dan iOS. Kamera dipakai
  untuk scan barcode.
- Staf menerima dokumen referensi seperti PO atau surat jalan, dan nomornya
  dicatat pada transaksi.
- Koneksi internet tersedia. Aplikasi tidak dirancang untuk offline.
- Bahasa antarmuka Indonesia.
- Sesi opname bisa mencakup satu lokasi atau semua lokasi, dan bisa dibatasi
  per kategori.

## Capabilities and Constraints

- Login email dan password. Token disimpan di perangkat dan dikirim sebagai
  Bearer pada setiap request.
- Barang masuk dan keluar dengan `sku`, `location_id`, `qty`, `reference_no`,
  dan catatan opsional.
- Pencarian barang lewat SKU (`/items/lookup`).
- Opname per sesi audit: daftar item, qty sistem, qty aktual, selisih, dan
  status scan.
- Riwayat transaksi dengan filter tipe dan paginasi.
- Daftar lokasi gudang, lalu stok per lokasi.
- Scanner barcode hanya berfungsi di build native. Tidak ada fallback kamera
  di web.
- Data mengikuti API `https://api-logisync.3.25.191.99.nip.io/api`. Beberapa
  endpoint belum punya schema respons lengkap di `docs/api-docs.json`.
- Satu perusahaan dengan banyak lokasi, bukan multi-tenant SaaS.
- Online-only.
- Keputusan terbuka: apakah supervisor dan admin akan memakai aplikasi yang
  sama.

## Brand Commitments

- Nama produk: Logisync.
- Logo: `public/img/logo.png` untuk web, `assets/logo.png` untuk ikon native.
  Mark oranye dan abu-abu.
- Splash: `assets/splash.png` untuk native, `public/img/splash.webp` untuk boot web.
  Gambar asli disimpan di `assets/splash-original.png`.
- Tema terang saja, tanpa dark mode.
- Palet dari `CONTEXT.md`: primary `#2563EB`, success `#059669`,
  warning `#D97706`, danger `#DC2626`, background `#F4F5F8`,
  surface `#FFFFFF`, text `#1F2937`, secondary `#6B7280`.
- Wordmark dua warna mengikuti splash: "Logi" `#222E3D`, "Sync" `#F89B13`.
- Tipografi: Inter Variable, self-hosted lewat `@fontsource-variable/inter`,
  dipakai untuk seluruh teks aplikasi termasuk wordmark dan label menu. Teks
  yang menyatu di dalam gambar splash tetap bagian dari aset gambar.
- Nada bahasa: langsung dan operasional, memakai istilah yang sudah dipakai
  staf gudang (barang masuk, barang keluar, opname, lokasi, SKU).

## Evidence on Hand

- Spesifikasi API: `docs/api-docs.json`.
- Kontrak dan preferensi produk: `CONTEXT.md`.
- Logo: `public/img/logo.png` dan `assets/logo.png`.
- Ikon menu: `public/img/menu_icons/opt/` (WebP), sumber SVG di
  `assets/menu_icons/`.
- Splash: `assets/splash.png` dan `public/img/splash.webp`.
- Tidak ada testimoni pelanggan, studi kasus, metrik penggunaan, atau materi
  pemasaran. Jangan mengarang klaim tersebut.

## Product Principles

1. Catat dulu, rapikan kemudian: transaksi selesai dalam beberapa ketukan,
   termasuk saat memakai scan.
2. Setiap angka stok bisa ditelusuri ke transaksi, lokasi, referensi, dan
   pengguna.
3. Opname adalah alur kerja, bukan laporan: progres hitung dan selisih tampil
   saat sesi berjalan.
4. Satu sumber data dengan sistem gudang. Aplikasi tidak menyimpan versi stok
   sendiri.
5. Tampilan mengikuti kondisi lapangan: kontras tinggi, tombol besar, teks
   pendek, dan terbaca sambil berdiri.
