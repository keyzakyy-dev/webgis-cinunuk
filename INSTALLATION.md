# Instalasi SIG Desa Cinunuk (Node.js + Express + MySQL)

Panduan cepat untuk menjalankan **backend API** dan **frontend React** secara lokal atau production.

---

## 1. Persyaratan

| Software | Versi Minimum |
|----------|---------------|
| Node.js  | 18+ (rekomendasi 20+) |
| MySQL / MariaDB | 5.7+ / 10.3+ |
| npm      | 9+ (termasuk di Node.js) |

---

## 2. Struktur Project

```
webgis-cinunuk/
├── backend/          # Node.js + Express API
│   ├── src/          # Source code
│   ├── scripts/      # DB setup & seed
│   ├── public/uploads/  # Foto POI (static)
│   ├── .env          # Konfigurasi (jangan commit)
│   └── package.json
├── frontend/         # React + Vite + Leaflet
│   ├── src/
│   ├── public/
│   ├── .env          # VITE_API_URL
│   └── package.json
└── INSTALLATION.md
```

---

## 3. Setup Database (MySQL)

1. Pastikan MySQL/MariaDB berjalan di `localhost:3306`.
2. Buat database (opsional, otomatis via script):
   ```sql
   CREATE DATABASE sig_cinunuk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

---

## 4. Backend Setup

```bash
cd backend

# 1. Install dependency
npm install

# 2. Salin .env.example → .env dan sesuaikan
#    (DB_HOST, DB_USER, DB_PASS, DB_NAME, JWT_SECRET, PORT)
cp .env.example .env

# 3. Setup tabel + seed layer default + buat admin (admin/admin123)
npm run setup

# Atau lengkap dengan import fitur dari folder polygon/
npm run setup:full

# 4. Jalankan server
npm start          # production
npm run dev        # development (auto-reload)
```

Server API: `http://localhost:3001`
- Health check: `GET /api/health`
- Docs endpoint: `GET /api/layers`, `GET /api/features`

---

## 5. Frontend Setup

```bash
cd frontend

# 1. Install dependency
npm install

# 2. (Opsional) Set API URL production
#    Default sudah localhost:3001 via Vite proxy
echo "VITE_API_URL=http://localhost:3001" > .env

# 3. Development server
npm run dev
```

Frontend: `http://localhost:5173`
- Peta publik: `/#/peta`
- Admin panel: `/#/admin` (login: **admin / admin123**)

---

## 6. Konfigurasi Production

### Backend `.env`
```env
DB_HOST=your-db-host
DB_PORT=3306
DB_NAME=sig_cinunuk
DB_USER=your-user
DB_PASS=strong-password
JWT_SECRET=generate-strong-random-string-32-chars-min
JWT_EXPIRES_IN=7d
PORT=3001
UPLOAD_DIR=public/uploads
MAX_UPLOAD_SIZE=5242880
```

### Frontend `.env`
```env
VITE_API_URL=https://api.domain-anda.com
```

### CORS (backend/src/server.js)
Tambahkan domain frontend ke array `origin`:
```js
origin: [
  'https://domain-anda.com',
  'https://www.domain-anda.com'
]
```

### Reverse Proxy (Nginx/Apache)
Proxy request ke Node.js:
```nginx
location /api/ {
  proxy_pass http://localhost:3001;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection 'upgrade';
  proxy_set_header Host $host;
  proxy_cache_bypass $http_upgrade;
}
location /uploads/ {
  proxy_pass http://localhost:3001;
}
```

---

## 7. Endpoint API Ringkas

| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|------------|
| GET | `/api/health` | — | Cek status |
| POST | `/api/auth/login` | — | Login → JWT |
| GET | `/api/auth/me` | Bearer | User aktif |
| GET | `/api/layers?all=1` | — | List layer |
| GET | `/api/layers/:id` | — | Layer + GeoJSON |
| POST | `/api/layers` | Bearer | Tambah layer |
| PUT | `/api/layers/:id` | Bearer | Update layer |
| DELETE | `/api/layers/:id` | Bearer | Hapus layer |
| GET | `/api/features` | — | List fitur |
| POST | `/api/features` | Bearer | Tambah fitur |
| POST | `/api/features/import` | Bearer | Import GeoJSON |
| POST | `/api/upload` | Bearer | Upload foto |

---

## 8. Checklist Sebelum Deploy

- [ ] `JWT_SECRET` di-generate random (≥32 karakter)
- [ ] Password admin default diubah
- [ ] `DB_PASS` diisi kuat
- [ ] HTTPS aktif (SSL cert)
- [ ] Backup DB rutin (`mysqldump`)
- [ ] Folder `public/uploads` writable
- [ ] CORS domain frontend di-set
- [ ] `.env` tidak di-commit ke git

---

## 9. Troubleshooting

| Gejala | Penyebab & Solusi |
|--------|-------------------|
| `ECONNREFUSED 3306` | MySQL belum jalan — start service MySQL/MariaDB |
| `ER_ACCESS_DENIED_ERROR` | User/password DB salah di `.env` |
| CORS error di browser | Tambah domain frontend ke `cors({ origin: [...] })` di `server.js` |
| Login admin gagal | Pastikan user `admin` ada di tabel `users` (jalankan `npm run setup`) |
| Peta kosong / blank | Cek Console DevTools → error JS / network; pastikan API `/api/layers` balik 200 |
| Upload foto 413/500 | Cek `MAX_UPLOAD_SIZE` & permission folder `public/uploads` |
| Import GeoJSON 0 fitur | File harus `FeatureCollection` dengan `features[]` array |

---

## 10. Menjalankan Test Cepat

```bash
# Backend health
curl http://localhost:3001/api/health

# List layer
curl http://localhost:3001/api/layers

# Login admin
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Semua response format: `{ "success": true|false, "data": ..., "message": ... }`.