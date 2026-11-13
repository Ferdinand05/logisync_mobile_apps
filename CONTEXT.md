# LOGISYNC - PROJECT CONTEXT & KNOWLEDGE BASE
**Project Name:** Logisync
**Developer Identity:** Ferdinand Koryanto (Full-Stack Web Developer)
**Domain:** Sistem Manajemen Gudang (Warehouse Management System)
# API
Endpoint : https://api-logisync.3.25.191.99.nip.io/api
Docs : in folder /docs/api-docs.json

# Authentication
Autentikasi & Interceptor
- Flow Login: POST /api/login dengan payload { email, password }. Server merespons dengan JSON token & data profil user.
- Token Storage: Token disimpan secara persisten melalui modul src/utils/storage.ts (menggunakan localStorage saat dev/browser, dan @capacitor/preferences saat dipaketkan ke APK/IPA).
- Axios Interceptor: Setiap request otomatis menyisipkan header Authorization: Bearer <token>. Jika API merespons 401 Unauthorized, interceptor menghapus token dari storage lokal dan mengarahkan tampilan ke halaman Login.

# Docs
- Tanstack Vue Query : https://tanstack.com/query/latest/docs/framework/vue/guides/queries -> for queries
                      https://tanstack.com/query/latest/docs/framework/vue/guides/mutations -> for mutations
                      https://tanstack.com/query/latest/docs/framework/vue/guides/mutations -> guides
- Ionic Vue Components : https://ionicframework.com/docs/components
- Ionic Vue Guides : https://ionicframework.com/docs/                     

Contoh struktur folder untuk API: 
```text
src/
├── api/
│   ├── client.ts                      # Axios instance, Interceptors, & Base URL
│   └── features/
│       ├── auth/                      # Fitur Autentikasi
│       │   ├── types.ts               # Interface TypeScript Request/Response
│       │   ├── auth.queries.ts        # TanStack useQuery (GET Profile/User)
│       │   └── auth.mutate.ts         # TanStack useMutation (POST Login/Logout)
│       └── stock/                     # Fitur Stok & Inventory Gudang
│           ├── types.ts
│           ├── stock.queries.ts       # TanStack useQuery (GET Items/Categories)
│           └── stock.mutate.ts        # TanStack useMutation (POST/PATCH Stock Updates)
├── utils/
│   └── storage.ts                     # Abstraksi Storage (Web LocalStorage vs Capacitor Preferences)
└── views/
    ├── TabsLayout.vue                 # 4 Bottom Tab Navigation Shell
    ├── dashboard/
    │   └── Home.vue                   # Home View (Grid 2 Kolom, Ikon Penuh)
    ├── warehouse/
    │   ├── Stock.vue                  # Halaman Lokasi Gudang
    │   └── History.vue                # Halaman Log Transaksi
    └── auth/
        ├── Login.vue                  # Form Login Staf Gudang
        └── Profile.vue                # Detail Profil Staf & Logout
```
        
## 4. UI/UX PREFERENCES
*   Tema aplikasi: **Light Theme** (Terang, clean, minimalis).
*   **Font:** Inter (self-hosted, variable) untuk seluruh teks, wordmark, dan label menu.
*   **Background:** `#F4F5F8` (Light Gray/Off-white) untuk halaman, `#FFFFFF` untuk *cards* & *modals*.
*   **Primary Accent:** Warna solid yang mencolok (misal: Biru Laut atau Hijau Logistik) untuk tombol dan ikon aktif.
*   **Navigasi:** Bottom Tab Bar (4 menu utama).
*   **Layout Home:** Grid 2 kolom. Kartu mengikuti tinggi isi, ikon selebar kartu, dan label di tengah.

## 5. UI/UX DESIGN SYSTEM & LAYOUT SPECIFICATIONS
Tema & Palette Warna
Theme Concept: Light Theme (Terang, clean, kontras tinggi untuk fleksibilitas kerja lapangan staf gudang).
Color Palette:
Primary Accent: #2563EB (Royal Blue - Utama/Tombol/Tab Aktif)
Success (Inbound): #059669 (Emerald Green - Barang Masuk)
Warning (Scan): #D97706 (Amber Orange - Scan Barcode)
Danger (Audit/Delete): #DC2626 (Red - Audit Stok & Hapus)
Background Page: #F4F5F8 (Light Off-White)
Background Surface/Card: #FFFFFF (Pure White)
Text Primary: #1F2937 (Dark Charcoal)
Text Secondary: #6B7280 (Muted Gray)


## Struktur Navigasi
- Navigasi tabs : Beranda (Home) , Opname(Audit session), Stock In/out(Transaction), riwayat transaksi in/out
- Header  : sediakan ruang untuk logo (Left dan profile untuk logout/profile (right)
- di beranda (home) : buat 2 grid cards untuk menu cepat
