# Panduan Instalasi SIG Desa Cinunuk

## Daftar Isi
1. [Prasyarat](#1-prasyarat)
2. [Struktur Proyek](#2-struktur-proyek)
3. [Instalasi Backend (PHP + MySQL)](#3-instalasi-backend-php--mysql)
4. [Instalasi Frontend (React)](#4-instalasi-frontend-react)
5. [Menjalankan Aplikasi](#5-menjalankan-aplikasi)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. Prasyarat

| Komponen | Versi Minimal | Keterangan |
|----------|--------------|------------|
| PHP | 7.4+ | Disarankan 8.1+ |
| MySQL/MariaDB | 5.6+ | Disarankan 8.0+ |
| Node.js | 18.x+ | Untuk frontend |
| npm | 9.x+ | |
| Composer | 2.x | (opsional) |

### Ekstensi PHP Wajib
- `mysqli` atau `pdo_mysql`
- `gd`
- `mbstring`
- `openssl`
- `xml`
- `zip`

---

## 2. Struktur Proyek

```
webgis-cinunuk/
├── frontend/                 # React + Vite (SPA)
│   ├── public/
│   │   ├── data/            # File GeoJSON statis
│   │   └── images/          # Asset gambar
│   ├── src/
│   │   ├── components/      # Komponen React
│   │   ├── pages/           # Halaman aplikasi
│   │   └── data/            # Konfigurasi
│   ├── index.html
│   └── package.json
├── backend/                  # PHP API
│   ├── config/
│   │   └── database.php     # Konfigurasi database
│   ├── models/
│   │   ├── Auth.php         # Autentikasi
│   │   ├── Layer.php        # CRUD layer
│   │   └── Feature.php      # CRUD fitur
│   ├── controllers/
│   ├── admin/               # Panel admin
│   ├── public/
│   │   ├── index.php        # Entry point API
│   │   └── uploads/         # Folder upload foto
│   └── database.sql         # Schema database
└── polygon/                 # Data GeoJSON asli
```

---

## 3. Instalasi Backend (PHP + MySQL)

### 3.1 Setup Database

1. Buat database:
```sql
CREATE DATABASE sig_cinunuk
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

2. Import schema:
```bash
# Via command line
mysql -u root -p sig_cinunuk < backend/database.sql

# Atau via phpMyAdmin:
# Buka phpMyAdmin → pilih database sig_cinunuk
# Klik tab Import → pilih file database.sql → Go
```

3. (Opsional) Generate password hash admin:
```bash
php -r "echo password_hash('admin123', PASSWORD_DEFAULT);"
```
Update hash di tabel users jika perlu.

### 3.2 Konfigurasi Database

Edit file `backend/config/database.php`:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'sig_cinunuk');
define('DB_USER', 'root');
define('DB_PASS', ''); // Isi password MySQL
define('DB_CHARSET', 'utf8mb4');
```

### 3.3 Jalankan Backend

#### Opsi A: Laragon (Windows)
1. Buka Laragon → Start All
2. Copy folder `backend/` ke `C:\laragon\www\gis\`
3. Akses: `http://localhost/gis/admin/login.php`

#### Opsi B: PHP Built-in Server
```bash
cd backend
php -S localhost:8080 -t public/
```
Akses: `http://localhost:8080/admin/login.php`

#### Opsi C: XAMPP
1. Copy folder `backend/` ke `C:\xampp\htdocs\gis\`
2. Start Apache & MySQL via XAMPP Control Panel
3. Akses: `http://localhost/gis/admin/login.php`

### 3.4 Login Admin
1. Buka `http://localhost:8080/admin/login.php`
2. Username: `admin`
3. Password: `admin123`
4. (Ganti password setelah login pertama)

---

## 4. Instalasi Frontend (React)

### 4.1 Instal Dependensi
```bash
cd frontend
npm install
```

### 4.2 Jalankan Dev Server
```bash
npm run dev
```
Akses: `http://localhost:5173`

### 4.3 Build untuk Production
```bash
npm run build
```
Hasil build: `frontend/dist/`

---

## 5. Menjalankan Aplikasi

### Mode Development
1. Jalankan backend: `php -S localhost:8080 -t backend/public/`
2. Jalankan frontend: `npm run dev` (di folder frontend)
3. Buka browser: `http://localhost:5173`

### Mode Production
1. Build frontend: `npm run build`
2. Deploy `frontend/dist/` ke web server
3. Deploy `backend/` ke subfolder (misal: `/api/`)
4. Konfigurasi CORS di `backend/config/database.php`

---

## 6. Troubleshooting

| Masalah | Solusi |
|---------|--------|
| **PHP error: class not found** | Pastikan `require_once` path benar. Jalankan `composer dump-autoload` jika menggunakan Composer. |
| **MySQL connection refused** | Pastikan MySQL berjalan. Cek port (default: 3306). |
| **404 pada API** | Pastikan `public/.htaccess` ada. Apache harus mengizinkan `AllowOverride All`. |
| **CORS error** | Update `Access-Control-Allow-Origin` di `backend/config/database.php` dengan domain frontend. |
| **Upload foto gagal** | Cek permission folder `public/uploads/`. Harus writable (755). |
| **GeoJSON tidak tampil** | Pastikan file `.geojson` ada di `frontend/public/data/`. Cek format JSON valid. |
| **npm install error** | Coba hapus `node_modules/` dan `package-lock.json`, lalu `npm install` ulang. |
| **Panel admin tidak bisa login** | Cek hash password di database. Generate ulang dengan `php -r "echo password_hash('admin123', PASSWORD_DEFAULT);"`. |

---

## 7. Catatan Penting

- **Keamanan:** Hapus file `tools/install.php` dan `database.sql` setelah instalasi selesai.
- **Backup:** Lakukan backup database secara rutin.
- **Update:** Untuk update data spasial, upload file GeoJSON baru ke `frontend/public/data/` atau gunakan panel admin.
- **Password:** Ganti password default admin segera setelah login pertama.

---

**Dibuat oleh:** Tim Pengembang SIG Desa Cinunuk
**Versi Dokumen:** 1.0
**Terakhir diperbarui:** Agustus 2026