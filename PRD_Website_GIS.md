# PRD: Website Sistem Informasi Geografis (SIG) Wilayah

## 1. Informasi Dokumen
| Item | Detail |
|---|---|
| Nama Produk | [Isi: mis. "Peta Wilayah Desa X" / "SIG Desa X"] |
| Versi Dokumen | 1.0 |
| Tanggal | 31 Agustus 2026 |
| Disusun oleh | [Isi nama/tim] |
| Status | Draft |

## 2. Ringkasan Produk
Website publik yang menyajikan informasi lokasi, batas wilayah desa, dan legenda peta dalam bentuk peta interaktif. Ditujukan agar masyarakat umum dapat dengan mudah mengetahui letak, batas, dan keterangan wilayah tanpa perlu membaca peta cetak atau data mentah.

## 3. Latar Belakang & Tujuan
**Latar Belakang:** Informasi batas desa dan lokasi penting saat ini umumnya berupa peta cetak/statis yang sulit diakses dan diperbarui, sehingga masyarakat kesulitan mendapatkan informasi kewilayahan yang akurat dan mutakhir.

**Tujuan Produk:**
1. Menyediakan informasi lokasi dan batas wilayah desa secara digital, visual, dan mudah diakses publik.
2. Membantu masyarakat memahami legenda/simbol peta tanpa latar belakang teknis GIS.
3. Meningkatkan transparansi dan aksesibilitas data kewilayahan.

## 4. Target Pengguna
- **Primer:** Masyarakat umum — warga, pendatang baru, atau siapa pun yang mencari informasi wilayah/lokasi.
- **Asumsi persona:** Pengguna awam teknologi GIS, mayoritas mengakses via smartphone, butuh tampilan yang langsung jelas dan tidak rumit.

## 5. Ruang Lingkup

**Termasuk (Fase 1 — MVP, halaman minimal):**
- Halaman Utama (Beranda)
- Halaman Peta Interaktif (termasuk legenda)
- Detail lokasi/desa (via popup, bukan halaman terpisah)
- Halaman Tentang/Kontak

**Tidak termasuk (Fase 1):**
- Login/akun pengguna
- Panel admin untuk input data mandiri
- Analisis spasial lanjutan (buffer, overlay, dll.)
- Aplikasi mobile native

## 6. Struktur Halaman (Sitemap)
| Halaman | Tujuan | Prioritas |
|---|---|---|
| Beranda | Landing page yang langsung menegaskan identitas "website GIS" + pintu masuk ke peta | P0 – Wajib |
| Peta Interaktif | Menampilkan batas desa, titik lokasi, dan legenda secara interaktif | P0 – Wajib |
| Detail Lokasi/Desa | Info rinci per titik/wilayah (popup di atas peta) | P0 – Wajib |
| Tentang/Kontak | Info pengelola, sumber data, kontak | P1 – Opsional |

## 7. Kebutuhan Fungsional

### 7.1 Halaman Utama (Beranda) — Fokus Utama
Karena syarat utamanya adalah halaman utama harus **langsung terlihat sebagai website GIS**, berikut requirement wajibnya:

| ID | Requirement | Deskripsi |
|---|---|---|
| FR-01 | Hero peta interaktif | Cuplikan peta (mini-map/live preview) tampil di atas layar (above the fold) — bukan ilustrasi generik |
| FR-02 | Judul & tagline eksplisit | Judul menyebut "Peta"/"GIS"/"Sistem Informasi Geografis" + tagline (mis. "Informasi Batas Desa & Lokasi Wilayah [Nama Daerah]") |
| FR-03 | CTA ke peta penuh | Tombol jelas: "Buka Peta Interaktif" |
| FR-04 | Statistik wilayah singkat | Angka ringkas: jumlah desa/dusun, luas wilayah, jumlah titik lokasi terdaftar |
| FR-05 | Pratinjau legenda | Cuplikan simbol/warna peta agar pengguna langsung paham cara membacanya |
| FR-06 | Pencarian cepat lokasi | Search bar di beranda, hasil klik mengarah ke peta dengan lokasi ter-zoom |
| FR-07 | Navigasi minimal | Menu: Beranda, Peta, Tentang/Kontak |

### 7.2 Halaman Peta Interaktif
| ID | Requirement | Deskripsi |
|---|---|---|
| FR-08 | Basemap | Peta dasar standar (mis. OpenStreetMap) |
| FR-09 | Layer batas desa | Poligon batas administrasi, dapat ditampilkan/disembunyikan |
| FR-10 | Layer titik lokasi | Marker untuk lokasi penting (kantor desa, fasilitas umum, dll.) |
| FR-11 | Legenda interaktif | Panel legenda yang bisa diciutkan (collapsible) |
| FR-12 | Popup info | Klik batas/marker menampilkan info ringkas |
| FR-13 | Pencarian & zoom | Kolom pencarian nama wilayah/lokasi, otomatis zoom |
| FR-14 | Kontrol peta | Zoom in/out, geser, reset ke tampilan awal |
| FR-15 | Responsif mobile | Tetap mudah dipakai di layar smartphone |

### 7.3 Detail Lokasi/Desa
Ditampilkan sebagai popup/modal saat elemen peta diklik (agar jumlah halaman tetap minimal). Isi minimal: nama wilayah/lokasi, kategori, deskripsi singkat, luas (untuk batas desa), foto (opsional).

### 7.4 Tentang/Kontak
Deskripsi singkat pengelola, sumber data & tanggal pembaruan, serta kontak (email/telepon/formulir sederhana).

## 8. Kebutuhan Data GIS
- Data batas administrasi desa (format GeoJSON/Shapefile)
- Data titik lokasi (POI) dengan koordinat latitude/longitude
- Skema legenda & simbol resmi
- Sumber data: [perlu dikonfirmasi — mis. BIG, Kemendagri, atau data internal desa]
- Kebijakan pembaruan data: [frekuensi & penanggung jawab — perlu dikonfirmasi]

## 9. Kebutuhan Non-Fungsional
- **Performa:** peta memuat < 3 detik pada koneksi standar
- **Kompatibilitas:** berjalan baik di browser umum & perangkat mobile
- **Aksesibilitas:** kontras warna legenda jelas, teks & tombol nyaman dibaca pengguna awam
- **Keamanan:** tanpa login, tidak menyimpan data pribadi pengguna
- **Bahasa:** Bahasa Indonesia yang sederhana

## 10. Alur Pengguna Utama
1. Pengguna membuka Beranda → langsung melihat cuplikan peta & statistik wilayah
2. Klik "Buka Peta Interaktif" atau cari lokasi langsung dari Beranda
3. Di halaman Peta, menjelajah/mencari batas desa atau lokasi tertentu
4. Klik area/marker → muncul info detail via popup
5. (Opsional) Cek Tentang/Kontak untuk sumber data atau menghubungi pengelola

## 11. Rekomendasi Teknis (opsional, disesuaikan tim dev)
- Library peta: Leaflet.js atau OpenLayers
- Basemap: OpenStreetMap
- Data spasial: GeoJSON statis (skala kecil) atau PostGIS + GeoServer (skala besar/dinamis)
- Frontend: framework web umum (React/Vue) atau HTML statis untuk MVP ringan

## 12. Metrik Keberhasilan (KPI)
- % pengunjung Beranda yang klik ke halaman Peta (target awal: >50%)
- Waktu rata-rata pengguna menemukan lokasi yang dicari (target: <30 detik)
- Jumlah kunjungan bulanan halaman Peta
- Hasil uji usability: pengguna baru langsung mengenali situs sebagai "website peta/GIS" tanpa penjelasan tambahan

## 13. Asumsi & Batasan
- Data batas desa & titik lokasi sudah/akan tersedia dalam format digital
- Fase 1 tidak mencakup input data mandiri oleh admin
- Cakupan wilayah [perlu dikonfirmasi: satu desa / kecamatan / kabupaten]

## 14. Lampiran: Deskripsi Wireframe Halaman Utama
1. **Header:** Logo + judul "Peta Wilayah [Nama Daerah]" + menu (Beranda, Peta, Tentang)
2. **Hero section:** peta mini interaktif sebagai latar utama + tagline + tombol "Buka Peta Interaktif" + search bar
3. **Section statistik:** 3–4 angka ringkas dalam bentuk kartu (jumlah desa, luas wilayah, dll.)
4. **Section legenda singkat:** preview simbol/warna dengan penjelasan ringkas
5. **Footer:** sumber data, tanggal update, kontak
