# Panduan Instalasi WebGIS Desa Cinunuk

Panduan lengkap untuk menjalankan aplikasi **WebGIS Desa Cinunuk** (Backend API + Frontend React) secara lokal maupun production.

---

## Persyaratan Sistem

| Software | Versi Minimum |
|----------|---------------|
| Node.js  | 18+ (rekomendasi 20+) |
| MySQL / MariaDB | 5.7+ / 10.3+ |
| npm      | 9+ (bawaan Node.js) |
| Git      | 2.30+ (opsional, untuk clone) |

---

## Struktur Proyek

```
webgis-cinunuk/
├── backend/                # Node.js + Express REST API
│   ├── src/
│   │   ├── server.js       # Entry point server
│   │   ├── config/db.js    # Koneksi database MySQL
│   │   ├── controllers/    # Logic handler (auth, layer, feature, upload)
│   │   ├── routes/         # Route definitions (auth, layers, features, upload, stats, logs)
│   │   ├── middleware/      # JWT authentication middleware
│   │   └── utils/          # Activity logger utility
│   ├── scripts/install.js  # Setup otomatis database, tabel, seed, & admin
│   ├── public/uploads/     # Folder foto POI yang diupload
│   ├── database.sql        # SQL schema manual (alternatif)
│   ├── .env.example        # Template konfigurasi environment
│   └── package.json
├── frontend/               # React 19 + Vite + Leaflet (SPA)
│   ├── src/
│   │   ├── pages/          # Halaman publik (Home, MapPage, LocationDetail) & admin
│   │   ├── components/     # Komponen UI (MapView, Header, Footer, dll)
│   │   ├── context/        # React Context (Auth, Toast, BackendStatus)
│   │   ├── utils/          # Utilitas (CSV export)
│   │   └── api.js          # HTTP client wrapper
│   ├── public/             # Asset statis (logo, gambar, data GeoJSON)
│   └── package.json
├── polygon/                # Data GeoJSON mentah wilayah desa (untuk import awal)
└── INSTALLATION.md         # File ini
```

---

## Langkah 1: Setup Database MySQL

1. Pastikan MySQL / MariaDB berjalan di mesin Anda.
2. Database akan dibuat otomatis oleh script installer (langkah berikutnya).
3. Jika ingin membuat manual:
   ```sql
   CREATE DATABASE sig_cinunuk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

---

## Langkah 2: Setup Backend

```bash
# Masuk ke folder backend
cd backend

# Install dependensi
npm install

# Salin file konfigurasi environment
cp .env.example .env
```

**Edit file `backend/.env`** sesuai konfigurasi database Anda:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=sig_cinunuk
DB_USER=root
DB_PASS=
JWT_SECRET=ganti-dengan-string-acak-minimal-32-karakter
JWT_EXPIRES_IN=7d
PORT=3001
UPLOAD_DIR=public/uploads
MAX_UPLOAD_SIZE=5242880
CORS_ORIGIN=http://localhost:5173,http://localhost:4173
```

**Jalankan installer otomatis** (membuat database, tabel, seed layer default, dan akun admin):

```bash
# Setup dasar (tabel + layer default + admin)
npm run setup

# Atau setup lengkap termasuk import GeoJSON dari folder polygon/
npm run setup:full
```

**Jalankan server backend:**

```bash
# Mode development (auto-reload saat file berubah)
npm run dev

# Mode production
npm start
```

Server API berjalan di: `http://localhost:3001`

Verifikasi:
```bash
curl http://localhost:3001/api/health
# Response: {"success":true,"message":"API OK"}
```

---

## Langkah 3: Setup Frontend

```bash
# Masuk ke folder frontend
cd frontend

# Install dependensi
npm install

# Jalankan development server
npm run dev
```

Frontend berjalan di: `http://localhost:5173`

> **Catatan:** Proxy ke backend (`/api` dan `/uploads`) sudah dikonfigurasi otomatis di `vite.config.js`. Tidak perlu set `VITE_API_URL` untuk development lokal.

---

## Langkah 4: Akses Aplikasi

| Halaman | URL |
|---------|-----|
| Beranda Publik | `http://localhost:5173/` |
| Peta Interaktif | `http://localhost:5173/#/peta` |
| Detail Lokasi | `http://localhost:5173/#/lokasi/:id` |
| Login Admin | `http://localhost:5173/#/admin/login` |
| Dashboard Admin | `http://localhost:5173/#/admin` |

**Akun Admin Default:**
- Username: `admin`
- Password: `admin123`

---

## Langkah 5: Build untuk Production

```bash
cd frontend
npm run build
```

Hasil build ada di folder `frontend/dist/`. Deploy folder ini ke web server statis (Nginx, Apache, Vercel, Netlify, dll).

---

## Konfigurasi Production

### Backend `.env` (Production)

```env
DB_HOST=your-production-db-host
DB_PORT=3306
DB_NAME=sig_cinunuk
DB_USER=your-db-user
DB_PASS=strong-production-password
JWT_SECRET=random-string-minimal-32-karakter-HARUS-DIGANTI
JWT_EXPIRES_IN=7d
PORT=3001
UPLOAD_DIR=public/uploads
MAX_UPLOAD_SIZE=5242880
CORS_ORIGIN=https://domain-anda.com,https://www.domain-anda.com
```

### Frontend `.env` (Production)

```env
VITE_API_URL=https://api.domain-anda.com
```

### Konfigurasi Nginx (Reverse Proxy)

```nginx
server {
    listen 80;
    server_name domain-anda.com;

    # Frontend (file statis)
    root /path/to/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API ke backend Node.js
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Proxy uploads
    location /uploads/ {
        proxy_pass http://localhost:3001;
    }
}
```

---

## Daftar Endpoint API

| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|------------|
| GET | `/api/health` | — | Cek status server |
| POST | `/api/auth/login` | — | Login admin, mengembalikan JWT |
| GET | `/api/auth/me` | Bearer | Data user yang sedang login |
| GET | `/api/layers?all=1` | — | Daftar semua layer (all=1 termasuk nonaktif) |
| GET | `/api/layers/:id` | — | Detail layer + GeoJSON features |
| POST | `/api/layers` | Bearer | Tambah layer baru |
| PUT | `/api/layers/:id` | Bearer | Update layer |
| DELETE | `/api/layers/:id` | Bearer | Hapus layer beserta fiturnya |
| GET | `/api/features` | — | Daftar fitur/POI aktif |
| GET | `/api/features/:id` | — | Detail fitur |
| POST | `/api/features` | Bearer | Tambah fitur/POI |
| PUT | `/api/features/:id` | Bearer | Update fitur |
| DELETE | `/api/features/:id` | Bearer | Hapus fitur |
| POST | `/api/features/import` | Bearer | Import GeoJSON massal |
| POST | `/api/upload` | Bearer | Upload foto (multipart) |
| GET | `/api/stats` | — | Statistik dashboard |
| GET | `/api/logs?limit=20` | Bearer | Riwayat aktivitas admin |

---

## Fitur Aplikasi

### Peta Publik
- Peta interaktif Leaflet dengan layer GeoJSON (polygon, garis, titik)
- Popup info lokasi dengan foto, deskripsi, dan tombol detail
- Pencarian lokasi real-time
- Toggle layer on/off dengan slider transparansi
- Pilihan peta dasar (Standard, Satelit, Terang, Gelap)
- Geolocation GPS ("Lokasi Saya")
- Filter radius ("Cari POI dalam X meter")
- Pengukur jarak spasial (Ruler Tool)
- Halaman detail lokasi lengkap (galeri foto, petunjuk arah, peta mini)
- Deteksi otomatis jika backend offline

### Panel Admin
- Dashboard analitik (statistik layer, chart geometri, donut rasio, activity log)
- Manajemen layer peta (CRUD, sorting, bulk action, export CSV, import GeoJSON)
- Manajemen fitur & POI (CRUD, search, filter, pagination, upload foto)
- Konfirmasi hapus dengan modal dialog
- Peringatan perubahan belum disimpan (unsaved changes)
- Breadcrumb navigasi
- Responsive mobile (sidebar drawer)
- Login modern split-screen dengan ilustrasi SVG GIS

---

## Checklist Sebelum Deploy

- [ ] `JWT_SECRET` sudah diganti dengan string acak unik (minimal 32 karakter)
- [ ] Password admin default (`admin123`) sudah diubah
- [ ] `DB_PASS` menggunakan password yang kuat
- [ ] HTTPS/SSL sudah aktif
- [ ] `CORS_ORIGIN` diisi domain frontend production
- [ ] Folder `backend/public/uploads` memiliki izin tulis (writable)
- [ ] File `.env` tidak ikut ter-commit ke git
- [ ] Backup database rutin sudah diatur (`mysqldump`)

---

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| `ECONNREFUSED 3306` | MySQL belum berjalan. Start service MySQL/MariaDB. |
| `ER_ACCESS_DENIED_ERROR` | Username/password database salah di `.env`. |
| CORS error di browser | Tambahkan domain frontend ke `CORS_ORIGIN` di `.env` backend. |
| Login admin gagal | Jalankan `npm run setup` ulang untuk membuat akun admin. |
| Peta kosong / data tidak muncul | Pastikan backend berjalan dan endpoint `/api/layers` merespons. |
| Upload foto error 413/500 | Cek `MAX_UPLOAD_SIZE` dan permission folder `public/uploads`. |
| Import GeoJSON 0 fitur | File harus format `FeatureCollection` dengan array `features[]`. |
| Banner "Backend Offline" muncul | Backend belum dijalankan atau port 3001 tidak dapat dijangkau. |

---

## Test Cepat

```bash
# Cek status backend
curl http://localhost:3001/api/health

# Daftar layer
curl http://localhost:3001/api/layers

# Login admin
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Semua response menggunakan format:
```json
{ "success": true, "data": { ... } }
```
