# Creator Content & Pipeline Tracker (Frontend)

Aplikasi manajemen ide, alur kerja produksi (_scripting, recording, editing, review_), hingga publikasi dan pencatatan analitik lintas platform (YouTube, TikTok, Instagram, LinkedIn) untuk _content creator_ dan tim produksinya.

Dibangun dengan **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, dan **shadcn/ui**, terintegrasi penuh dengan Backend REST API sesuai dokumen **Spesifikasi Proyek Creator Content Pipeline Tracker**.

---

## 📋 Daftar Isi

1. [Fitur Utama](#-fitur-utama)
2. [Arsitektur & Tech Stack](#-arsitektur--tech-stack)
3. [Prasyarat Sistem](#-prasyarat-sistem)
4. [Panduan Instalasi & Setup Lokal](#-panduan-instalasi--setup-lokal)
5. [Konfigurasi Environment (.env)](#-konfigurasi-environment-env)
6. [Menjalankan Aplikasi](#-menjalankan-aplikasi)
7. [Pengujian Otomatis & Skenario QA (TC-01 - TC-04)](#-pengujian-otomatis--skenario-qa-tc-01---tc-04)
8. [Pemeriksaan Kualitas Kode (Quality Gates)](#-pemeriksaan-kualitas-kode-quality-gates)
9. [Kontrak Endpoint REST API](#-kontrak-endpoint-rest-api)
10. [Struktur Direktori Proyek](#-struktur-direktori-proyek)

---

## ✨ Fitur Utama

- **Autentikasi & Sesi (CCP-02)**:
  - Pendaftaran akun kreator baru dengan pencegahan email duplikat (**TC-01**).
  - Login aman dengan bearer token dan manajemen sesi tersinkronisasi.
  - Opsi _Logout_ dengan pembersihan sesi seketika.
- **Manajemen Channel / Saluran (CCP-02)**:
  - Registrasi profil channel terdistribusi (YouTube, TikTok, Instagram, LinkedIn).
  - Tampilan direktori saluran terhubung dengan status aktif dan refresh real-time.
- **Pipeline Siklus Hidup Konten (CCP-03)**:
  - 6 Tahap Siklus Hidup: `Idea` ➔ `Scripting` ➔ `Recording` ➔ `Editing` ➔ `Ready` ➔ `Published`.
  - Filter interaktif berdasarkan status, format konten, saluran, dan platform sosial.
  - Form pembuatan konten dengan validasi ketat judul (**TC-02**), target channel, dan format.
  - Fitur pengeditan konten dinamis (`/contents/[id]/edit`).
- **Checklist Subtugas Produksi (CCP-04)**:
  - Daftar subtugas teknis dinamis (misal: "Draft hook naskah", "B-roll direkam", "Thumbnail disetujui").
  - Toggle centang selesai menggunakan _Optimistic UI Update_ tanpa reload halaman.
  - Tambah dan hapus item checklist dengan kalkulasi progress bar real-time.
- **Validasi Publikasi & Pencatatan Metrik (CCP-05)**:
  - Transisi ke status `published` memvalidasi kelayakan `published_url` (**TC-03**).
  - Form pencatatan snapshot analitik performa (`Views`, `Likes`, `Comments`, `Shares`).
  - Riwayat log statistik terurut dari tanggal terbaru ke terlama (_newest first_).
  - Aksi hapus konten dengan aturan _Cascade Delete_ (**TC-04**) tanpa meninggalkan _orphan records_.

---

## 🏗 Arsitektur & Tech Stack

Aplikasi ini menggunakan pola arsitektur **Decoupled REST API + Frontend SPA/SSR**:

- **Framework:** Next.js 16.4.1 (App Router, Turbopack, React 19)
- **Language:** TypeScript 5 (Strict Mode)
- **Styling & UI:** Tailwind CSS v4, shadcn/ui components, Lucide Icons
- **Backend Target:** REST API Service yang berjalan di `http://localhost:5000/api`
- **Session & Auth:** HTTP Bearer token integration + Secure Session helper

---

## 💻 Prasyarat Sistem

Sebelum memulai, pastikan perangkat Anda telah terinstal:

- **Node.js**: Versi `>= 20.0.0` (Disarankan Node.js `22.6+` untuk dukungan native test runner).
- **npm**: Versi `>= 9.0.0`
- **Backend API**: Server backend aktif dan dapat diakses di `http://localhost:5000/api`.

---

## 🚀 Panduan Instalasi & Setup Lokal

### 1. Masuk ke Direktori Frontend

```bash
cd c:\pipeline_tracker_cc\frontend_nextjs
```

### 2. Instal Dependensi

```bash
npm install
```

### 3. Konfigurasi File Environment

Salin template file `.env.example` ke `.env`:

```bash
cp .env.example .env
```

---

## ⚙️ Konfigurasi Environment (.env)

Pastikan isi file `.env` mengarah ke alamat endpoint server backend Anda:

```env
# Koneksi Server REST Backend
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

- `API`: Digunakan pada level server-side (Server Components dan Route Fetching).
- `NEXT_PUBLIC_API_URL`: Digunakan pada level browser/client-side (React Client Components).

---

## 🏃 Menjalankan Aplikasi

### Mode Pengembangan (Development)

Jalankan dev server dengan Turbopack:

```bash
npm run dev
```

Aplikasi akan berjalan di: **[http://localhost:3000](http://localhost:3000)**

### Build Produksi (Production Build)

```bash
npm run build
npm run start
```

---

## 🧪 Pengujian Otomatis & Skenario QA (TC-01 - TC-04)

Seluruh skenario pengujian yang diwajibkan pada **Spesifikasi Proyek Bab 8** telah dibuatkan test suite otomatis dan terverifikasi **100% PASS (30/30 tes lolos)**.

Jalankan test suite menggunakan Node native test runner:

```bash
npm test
```

### Matriks Pengujian Skenario QA:

|  ID Tes   | Skenario Uji Dokumen                                                                                      | File Pengujian                                                                      |   Status    |
| :-------: | :-------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------- | :---------: |
| **TC-01** | Register dengan email yang sudah terdaftar ditolak sistem dengan pesan _"Email already taken"_.           | `tests/qa-scenarios-compliance.test.mjs`<br>`tests/auth-channel-flow.test.mjs`      | ✅ **PASS** |
| **TC-02** | Buat konten tanpa mengisi kolom `title` ditolak sistem dan menampilkan pesan error wajib diisi.           | `tests/qa-scenarios-compliance.test.mjs`<br>`tests/content-pipeline-crud.test.mjs`  | ✅ **PASS** |
| **TC-03** | Ubah status konten ke `published` tanpa mengisi `published_url` valid ditolak dengan peringatan jelas.    | `tests/qa-scenarios-compliance.test.mjs`<br>`tests/publish-metric-cascade.test.mjs` | ✅ **PASS** |
| **TC-04** | Hapus entri konten yang memiliki checklist dan log metrik menghapus seluruh data anak (_Cascade Delete_). | `tests/qa-scenarios-compliance.test.mjs`<br>`tests/publish-metric-cascade.test.mjs` | ✅ **PASS** |

---

## 🛡 Pemeriksaan Kualitas Kode (Quality Gates)

Jalankan seluruh quality gates sebelum melakukan push/commit:

```bash
# 1. Jalankan Unit & Integration Test Suite
npm test

# 2. Periksa Linting & Standar Kode ESLint
npm run lint

# 3. Validasi Tipe Data TypeScript
npm run typecheck

# 4. Validasi Kompilasi Build Next.js
npm run build
```

---

## 📡 Kontrak Endpoint REST API

Aplikasi frontend berkomunikasi dengan backend melalui 12 endpoint standar REST API:

| Method   | Endpoint                          | Deskripsi Fitur                                        |   Status Code    |
| :------- | :-------------------------------- | :----------------------------------------------------- | :--------------: |
| `POST`   | `/api/v1/auth/register`           | Mendaftarkan akun kreator baru                         |  `201 Created`   |
| `POST`   | `/api/v1/auth/login`              | Autentikasi akun & penerbitan bearer token             |     `200 OK`     |
| `GET`    | `/api/v1/channels`                | Mengambil daftar saluran milik pengguna                |     `200 OK`     |
| `POST`   | `/api/v1/channels`                | Menambah platform saluran baru                         |  `201 Created`   |
| `GET`    | `/api/v1/contents`                | Mengambil list konten (filter: `?status=&channel_id=`) |     `200 OK`     |
| `POST`   | `/api/v1/contents`                | Membuat draf ide konten baru                           |  `201 Created`   |
| `GET`    | `/api/v1/contents/:id`            | Detail konten beserta checklist & riwayat metrik       |     `200 OK`     |
| `PATCH`  | `/api/v1/contents/:id`            | Update data konten & transisi status siklus hidup      |     `200 OK`     |
| `DELETE` | `/api/v1/contents/:id`            | Hapus konten beserta relasi checklist & metriknya      | `204 No Content` |
| `POST`   | `/api/v1/contents/:id/checklists` | Menambah item checklist subtugas produksi              |  `201 Created`   |
| `PATCH`  | `/api/v1/checklists/:id/toggle`   | Toggle centang status `is_completed` subtugas          |     `200 OK`     |
| `POST`   | `/api/v1/contents/:id/metrics`    | Mencatat log snapshot performa analitik                |  `201 Created`   |

---

## 📁 Struktur Direktori Proyek

```text
frontend_nextjs/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx           # Halaman Login
│   │   └── register/page.tsx        # Halaman Register
│   ├── (workspace)/
│   │   ├── layout.tsx               # Route guard sesi login
│   │   ├── channels/page.tsx        # Halaman Direktori Channel & Modal Tambah
│   │   ├── contents/page.tsx        # Halaman Pipeline Konten & Filter
│   │   ├── contents/new/page.tsx    # Halaman Tambah Konten Baru
│   │   ├── contents/[id]/page.tsx   # Halaman Detail Dinamis Konten & Metrik
│   │   └── contents/[id]/edit/page.tsx # Halaman Edit Konten
│   ├── globals.css                  # Konfigurasi Tailwind & Theme
│   └── layout.tsx                   # Root layout
├── components/
│   ├── auth/                        # Komponen formulir autentikasi & sesi
│   ├── contents/                    # Form konten, detail preview, & checklist
│   ├── layout/                      # Workspace Shell, sidebar, & header profil
│   └── ui/                          # UI primitives (Button, Dialog, Select, dll)
├── features/
│   ├── auth/                        # Schemas, services, & types autentikasi
│   ├── channels/                    # Schemas, services, & types channel
│   └── contents/                    # Schemas, services, & types pipeline konten
├── lib/
│   ├── api/
│   │   ├── client.ts                # Universal fetch wrapper (token & 204 handler)
│   │   ├── errors.ts                # ApiClientError & extractor pesan error backend
│   │   └── routes.ts                # Kamus endpoint REST API resmi
│   ├── auth/
│   │   └── session.ts               # Pengelola sesi & token browser
│   ├── env.ts                       # Helper normalisasi URL environment
│   └── utils.ts                     # Utility styling classnames
├── tests/
│   ├── api-foundation.test.mjs      # Pengujian normalisasi URL & klien API
│   ├── auth-channel-flow.test.mjs   # Pengujian form auth & channel
│   ├── content-pipeline-crud.test.mjs # Pengujian CRUD konten & filter
│   ├── publish-metric-cascade.test.mjs # Pengujian URL publish & cascade delete
│   └── qa-scenarios-compliance.test.mjs # Suite terintegrasi QA TC-01 s.d. TC-04
├── .env.example                     # Contoh template environment
├── package.json                     # Konfigurasi skrip dan dependensi
└── README.md                        # Dokumentasi teknis proyek
```

---

## 📄 Git Workflow & Commit Guidelines

Proyek ini mematuhi standar **Conventional Commits**:

- `feat:` Penambahan fitur baru (misal: `feat: add content status transition validation`)
- `fix:` Perbaikan bug (misal: `fix: prevent publishing without valid URL`)
- `test:` Penambahan atau perbaikan pengujian (misal: `test: add QA TC-01 to TC-04 test suite`)
- `docs:` Pembaruan dokumentasi (misal: `docs: update setup instructions in README`)
- `refactor:` Restrukturisasi kode tanpa mengubah perilaku fungsional
