# Skate Competition — Backend API

Backend API berbasis **Node.js + Express + Prisma ORM** yang siap dihubungkan ke **Supabase (PostgreSQL)**.

## Stack Teknologi
- **Runtime:** Node.js
- **Framework:** Express.js
- **ORM:** Prisma
- **Database:** PostgreSQL (Supabase / local PostgreSQL)
- **Auth:** JWT (JSON Web Token)
- **Password Hashing:** bcryptjs

## Struktur Folder
```
backend/
├── prisma/
│   ├── schema.prisma      # Skema database Prisma
│   └── seed.js            # Script pengisian data awal
├── src/
│   ├── lib/
│   │   └── prisma.js      # Prisma Client singleton
│   ├── middleware/
│   │   └── auth.middleware.js  # JWT verifyToken + requireRole
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── peserta.routes.js
│   │   ├── juri.routes.js
│   │   ├── admin.routes.js
│   │   ├── lomba.routes.js
│   │   ├── pendaftaran.routes.js
│   │   └── penilaian.routes.js
│   └── server.js
├── .env.example
├── .gitignore
└── package.json
```

## Cara Setup & Jalankan

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Buat File Konfigurasi `.env`
Salin berkas `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Isi `DATABASE_URL` dengan connection string dari Supabase Anda:
* Buka Dashboard Supabase → Project Anda → Settings → Database → Connection string → URI mode.
* Pastikan password database Supabase Anda telah dimasukkan ke dalam URI tersebut.

### 3. Sinkronkan Database ke Supabase
Jalankan perintah berikut untuk membuat semua tabel secara otomatis di Supabase:
```bash
npm run db:push
```

### 4. Jalankan Seeding (Mengisi Data Awal)
Jalankan script seed untuk memasukkan data jenis lomba, kategori lomba, jadwal lomba, akun admin, akun juri, dan beberapa akun peserta bawaan dari file `.sql` Anda:
```bash
npm run db:seed
```

### 5. Jalankan Server API
```bash
# Mode Development (auto-reload menggunakan nodemon)
npm run dev

# Mode Production
npm start
```
Server akan berjalan di port `3000` (atau port lain sesuai `.env`).

---

## API Endpoints Utama

### Autentikasi (`/api/auth`)
- `POST /api/auth/login` - Login bersama untuk Peserta, Juri, dan Admin.
- `POST /api/auth/register` - Pendaftaran akun Peserta baru (role dikunci sebagai `peserta`).
- `GET /api/auth/me` - Dapatkan info profil user yang sedang login menggunakan Bearer Token.

### Admin (`/api/admin`)
- `GET /api/admin/statistik` - Dapatkan total pendapatan, total peserta, juri, dll (hanya Admin).
- `GET /api/admin/rekap-nilai` - Ambil daftar rekap nilai keseluruhan atau filter berdasarkan jenis lomba.
- `GET /api/admin/pemenang` - Ambil list pemenang (Juara 1, 2, 3) tiap jadwal lomba.

### Juri / Penilaian (`/api/penilaian`)
- `POST /api/penilaian` - Juri mengirimkan nilai untuk 3 aspek (Teknik & Kontrol, Kecepatan & Agilitas, Kreativitas) ke pendaftaran peserta tertentu. Nilai akhir dihitung otomatis di backend.

### Pendaftaran (`/api/pendaftaran`)
- `POST /api/pendaftaran` - Peserta mendaftar jadwal lomba tertentu.
- `PATCH /api/pendaftaran/:id/status` - Admin menyetujui (status: `Terverifikasi` sekaligus memberikan Nomor BIB otomatis) atau menolak pendaftaran.
