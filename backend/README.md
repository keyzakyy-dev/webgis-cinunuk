# Backend SIG Desa Cinunuk (Node.js + Express + MySQL)

Backend REST API untuk mengelola data layer & fitur peta yang ditampilkan di frontend React + Leaflet. Panel admin kini terintegrasi di aplikasi frontend (route `/#/admin`).

## 1. Persyaratan
| Komponen | Minimum |
|----------|---------|
| Node.js  | 18+ (direkomendasikan 20+) |
| MySQL    | 5.7+ / MariaDB 10.3+ |

## 2. Struktur Folder
```
backend/
├── .env.example              # Template konfigurasi environment
├── .env                      # Konfigurasi lokal (tidak di-commit)
├── package.json
├── database.sql              # Skema MySQL (import manual opsional)
├── scripts/
│   └── install.js            # Setup DB + seed layer + buat admin
├── src/
│   ├── server.js             # Entry point Express
│   ├── config/
│   │   └── db.js             # Koneksi pool mysql2
│   ├── middleware/
│   │   └── auth.js           # Verifikasi JWT
│   ├── controllers/
│   │   ├── authController.js     # /api/auth
│   │   ├── layerController.js    # /api/layers
│   │   ├── featureController.js  # /api/features
│   │   └── uploadController.js   # /api/upload (multer)
│   └── routes/
│       ├── authRoutes.js
│       ├── layerRoutes.js
│       ├── featureRoutes.js
│       └── uploadRoutes.js
└── public/
    └── uploads/              # Folder foto (statis via /uploads)
        └── poi/
```

## 3. Instalasi

### 3.1 Konfigurasi
1. Salin `.env.example` → `.env`, sesuaikan kredensial DB:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=sig_cinunuk
   DB_USER=root
   DB_PASS=
   JWT_SECRET=ganti_dengan_secret_acak
   PORT=3001
   ```
2. Install dependency:
   ```bash
   cd backend
   npm install
   ```

### 3.2 Setup Database
Jalankan salah satu:
```bash
# Buat tabel + seed layer + buat admin (admin/admin123)
npm run setup

# Sama seperti di atas + import fitur dari folder polygon/*.geojson
npm run setup:full
```
Atau import manual `database.sql` lewat phpMyAdmin.

### 3.4 Jalankan Server
```bash
npm start        # produksi
npm run dev      # development (auto-reload via --watch)
```
Server: `http://localhost:3001`

## 4. Endpoint API

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/api/health` | — | Cek status API |
| POST | `/api/auth/login` | — | Login → JWT token |
| GET | `/api/auth/me` | Bearer | Data user aktif |
| GET | `/api/layers?all=1` | — | Daftar layer (tanpa `all` = hanya aktif) |
| GET | `/api/layers/:id` | — | Layer + GeoJSON FeatureCollection |
| POST | `/api/layers` | Bearer | Tambah layer |
| PUT | `/api/layers/:id` | Bearer | Update layer |
| DELETE | `/api/layers/:id` | Bearer | Hapus layer + fiturnya |
| GET | `/api/features?layer_id=X` | — | Daftar fitur |
| GET | `/api/features/:id` | — | Detail fitur |
| POST | `/api/features` | Bearer | Tambah fitur |
| PUT | `/api/features/:id` | Bearer | Update fitur |
| DELETE | `/api/features/:id` | Bearer | Hapus fitur |
| POST | `/api/features/import` | Bearer | Import GeoJSON (multipart: `layer_id`, `geojson`) |
| POST | `/api/upload` | Bearer | Upload foto (multipart: `file`, `subfolder`) |

Semua response berformat: `{ "success": true|false, "data": ..., "message": ... }`.

## 5. Panel Admin (React)
Terintegrasi di frontend. Akses: `http://localhost:5173/#/admin`

| Halaman | Fungsi |
|---------|--------|
| `/#/admin/login` | Login admin (JWT) |
| `/#/admin` | Dashboard ringkasan |
| `/#/admin/layers` | List + tambah/edit/hapus layer |
| `/#/admin/features` | List fitur (filter per layer) |
| `/#/admin/import` | Import GeoJSON ke layer |

Login default: **admin / admin123** (ganti segera).

## 6. Integrasi Frontend
`frontend/src/data/siteConfig.js` memakai `VITE_API_URL` (default `http://localhost:3001`).
Set via `frontend/.env`:
```
VITE_API_URL=http://localhost:3001
```

## 7. CORS
`src/server.js` mengizinkan origin `http://localhost:5173` & `http://localhost:4173`.
**Production:** tambahkan domain frontend di array `cors({ origin: [...] })`.

## 8. Keamanan & Production Checklist
- [ ] Ganti `JWT_SECRET` dengan nilai acak kuat
- [ ] Ganti password admin default
- [ ] Set `DB_PASS` kuat
- [ ] Hapus `database.sql` dari folder web-accessible
- [ ] Aktifkan HTTPS
- [ ] Backup DB rutin (mysqldump)

## 9. Troubleshooting
| Masalah | Solusi |
|---------|--------|
| `ECONNREFUSED 3306` | MySQL belum jalan — nyalakan service MySQL/MariaDB |
| `Cannot find package 'bcrypt'` | Pakai `bcryptjs` (sudah terpasang), jangan `bcrypt` |
| CORS blocked | Update array `origin` di `src/server.js` |
| Upload gagal | Cek permission `public/uploads`, `MAX_UPLOAD_SIZE` |
| Import 0 fitur | Pastikan file `FeatureCollection` dengan `features[]` |
