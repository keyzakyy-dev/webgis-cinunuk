# Backend SIG Desa Cinunuk (PHP + MySQL)

Backend untuk mengelola data layer & fitur peta yang ditampilkan di frontend React + Leaflet.

## 1. Persyaratan Server (Shared Hosting)
| Komponen | Minimum |
|----------|---------|
| PHP      | 8.1+ (direkomendasikan 8.2+) |
| MySQL    | 5.7+ / MariaDB 10.3+ |
| Ekstensi | pdo_mysql, json, mbstring, fileinfo, GD (untuk upload) |

## 2. Struktur Folder
```
backend/
├── .htaccess                 # Rewrite ke public/
├── database.sql              # Import ke MySQL (phpMyAdmin)
├── config/
│   ├── database.php          # Konfigurasi DB & CORS
│   └── Database.php          # Singleton PDO
├── models/
│   ├── Layer.php             # CRUD layer
│   ├── Feature.php           # CRUD fitur + import GeoJSON
│   ├── Auth.php              # Session login admin
│   └── Database.php          # (di sini sebagai class wrapper)
├── controllers/
│   ├── LayerController.php   # API /api/layers
│   ├── FeatureController.php # API /api/features
│   └── UploadController.php  # API /api/upload
├── public/
│   ├── index.php             # Entry point API (/api/*)
│   ├── .htaccess             # URL rewrite + CORS
│   └── uploads/              # Folder foto (chmod 755)
│       └── poi/
├── admin/                    # Panel admin (PHP)
│   ├── login.php
│   ├── dashboard.php
│   ├── layers.php
│   ├── layer_edit.php
│   ├── features.php
│   ├── feature_edit.php
│   ├── upload.php
│   ├── import.php
│   ├── logout.php
│   ├── style.css             # CSS admin
│   └── partials/
│       ├── header.php
│       └── sidebar.php
└── README.md
```

## 3. Instalasi (Shared Hosting via cPanel)

### 3.1 Database
1. Buka **phpMyAdmin** → buat database `sig_cinunuk` (utf8mb4_unicode_ci)
2. Import `database.sql`:
   ```sql
   -- Otomatis bikin tabel users, layers, features + seed data
   ```
3. Default admin login:
   - **Username:** `admin`
   - **Password:** `admin123`  *(ganti segera setelah login)*

### 3.2 File & Folder
1. Upload folder `backend/` ke `public_html/` (atau subfolder, mis. `public_html/gis/`)
2. Sesuaikan `config/database.php`:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_NAME', 'sig_cinunuk');
   define('DB_USER', 'username_cpanel_anda');
   define('DB_PASS', 'password_db_anda');
   ```
3. Set permission folder upload:
   - `public_html/gis/public/uploads` → **755** (writable)
3. Set permission folder admin & config:
   - `public_html/gis/config` → **644**
   - `public_html/gis/admin` → **644**

### 3.3 Verifikasi API
Buka browser:
```
https://domainanda.com/gis/api/health
# → {"success":true,"message":"API OK"}

https://domainanda.com/gis/api/layers
# → Daftar layer (JSON)

https://domainanda.com/gis/admin/
# → Halaman login admin
```

## 4. Integrasi Frontend (React + Leaflet)

Frontend saat ini pakai file GeoJSON statis (`/data/*.geojson`). Ganti dengan **fetch dari API**:

### Contoh: Load Layer di MapPage.jsx
```jsx
// Ganti fetch file statis:
const res = await fetch('https://domainanda.com/gis/api/layers/1');
const data = await res.json();
const geojson = data.data.geojson; // FeatureCollection
// render ke Leaflet pakai <GeoJSON data={geojson} ... />
```

### Contoh: Load Semua Layer + Fitur
```jsx
const layersRes = await fetch('https://domainanda.com/gis/api/layers');
const { data: layers } = await layersRes.json();

for (const layer of layers) {
  const res = await fetch(`https://domainanda.com/gis/api/layers/${layer.id}`);
  const { data } = await res.json();
  // data.geojson = FeatureCollection lengkap
}
```

### Contoh: Upload Foto (untuk admin)
```jsx
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('subfolder', 'poi');

const res = await fetch('https://domainanda.com/gis/api/upload', {
  method: 'POST',
  body: formData,
});
const { data } = await res.json();
// data.url = '/uploads/poi/20240115_abc123.jpg'
```

### CORS
File `config/database.php` sudah set header CORS untuk `http://localhost:5173` (dev).
**Production:** Ganti header di `config/database.php` & `public/.htaccess` ke domain frontend Anda:
```php
header('Access-Control-Allow-Origin: https://domainanda.com');
```

## 5. Alur Kerja Admin

| Halaman | Fungsi |
|---------|--------|
| `/admin/login.php` | Login admin |
| `/admin/dashboard.php` | Ringkasan layer & akses cepat |
| `/admin/layers.php` | List layer + tambah/edit/hapus |
| `/admin/layer_edit.php` | Form layer |
| `/admin/features.php` | List fitur (filter per layer) + import GeoJSON |
| `/admin/feature_edit.php` | Form fitur lengkap (peta klik koordinat, geometry GeoJSON, foto) |
| `/admin/upload.php` | Upload foto → return URL |
| `/admin/import.php` | Import GeoJSON ke layer |

### Import GeoJSON
1. Buka `/admin/import.php`
2. Pilih layer tujuan
3. Upload file `.geojson` (FeatureCollection)
3. Semua fitur di file otomatis masuk DB dengan geometry & properti aslinya.

## 6. Keamanan & Production Checklist

- [ ] Ganti password admin default
- [ ] Set `DB_PASS` kuat di `config/database.php`
- [ ] Hapus `database.sql` dari folder web-accessible (simpan di luar `public_html`)
- [ ] Set `APP_URL` & `API_URL` ke domain production
- [ ] Aktifkan SSL (HTTPS) di hosting
- [ ] Aktifkan PHP error logging: `ini_set('log_errors', 1); ini_set('error_log', '/path/to/php-error.log');`
- [ ] Backup database rutin (cronjob mysqldump)

## 7. Troubleshooting

| Masalah | Solusi |
|---------|--------|
| API 500 error | Cek log PHP: `public_html/gis/error_log` atau cPanel Error Log |
| CORS blocked | Update `Access-Control-Allow-Origin` di `config/database.php` & `public/.htaccess` ke domain frontend |
| Upload gagal | Cek folder `public/uploads` permission 755, cek `upload_max_filesize` di PHP.ini |
| GeoJSON import 0 fitur | Pastikan file punya `FeatureCollection.features[]`, bukan cuma `Feature` tunggal |
| Map tidak muncul di feature_edit | Pastikan Leaflet CSS/JS load via CDN (sudah di `feature_edit.php`) |

---

**Diperlukan Bantuan?** Buka issue atau hubungi developer. Struktur ini sudah diuji di shared hosting cPanel (PHP 8.2 + MariaDB 10.5).