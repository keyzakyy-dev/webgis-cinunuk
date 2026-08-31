-- =====================================================================
--  Database GIS Desa Cinunuk (MySQL / MariaDB)
--  Import file ini ke phpMyAdmin atau via command line.
--  Catatan: Tabel dibuat otomatis oleh tools/install.php,
--  tapi file ini tetap disediakan untuk import manual.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `sig_cinunuk`
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `sig_cinunuk`;

-- ---------------------------------------------------------------------
-- Tabel: users (admin)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username`   VARCHAR(60)  NOT NULL,
  `password`   VARCHAR(255) NOT NULL,
  `nama`       VARCHAR(100) NULL,
  `role`       ENUM('admin','editor') NOT NULL DEFAULT 'admin',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `u_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Tabel: layers (klasifikasi / tema peta)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `layers` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nama_layer` VARCHAR(100) NOT NULL,
  `tipe`       ENUM('polygon','line','point') NOT NULL DEFAULT 'point',
  `warna`      VARCHAR(7)   NOT NULL DEFAULT '#292524',
  `grup`       VARCHAR(50)  NOT NULL DEFAULT 'Lainnya',
  `urutan`     INT NOT NULL DEFAULT 0,
  `is_active`  TINYINT(1)   NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Tabel: features (POI / fitur peta, termasuk geometry GeoJSON)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `features` (
  `id`               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `layer_id`         INT UNSIGNED NOT NULL,
  `nama`             VARCHAR(200) NOT NULL,
  `deskripsi`        TEXT NULL,
  `deskripsi_lengkap` TEXT NULL,
  `alamat`           VARCHAR(255) NULL,
  `jam_layanan`      VARCHAR(100) NULL,
  `petunjuk_arah`    TEXT NULL,          -- JSON array
  `lat`              DECIMAL(11,8) NULL,
  `lng`              DECIMAL(11,8) NULL,
  `geometry`         LONGTEXT NULL,      -- GeoJSON (Polygon/LineString/Point)
  `foto_1`           VARCHAR(255) NULL,
  `foto_2`           VARCHAR(255) NULL,
  `foto_3`           VARCHAR(255) NULL,
  `is_active`        TINYINT(1) NOT NULL DEFAULT 1,
  `created_at`       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       DATETIME NULL,
  PRIMARY KEY (`id`),
  KEY `i_layer` (`layer_id`),
  CONSTRAINT `fk_feature_layer` FOREIGN KEY (`layer_id`)
    REFERENCES `layers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
--  SEED DATA
-- =====================================================================

-- Admin default: username = admin, password = admin123
-- (di-generate oleh tools/install.php; hash di bawah hanya fallback)
INSERT INTO `users` (`username`, `password`, `nama`, `role`) VALUES
('admin', '$2y$10$0n2cGvDZaU8rD5p9rIqEfuU5Z0R3mY5tK2JvWQaV9fQgYgT0pMmD6', 'Administrator Sig Cinunuk', 'admin');

-- Layer default
INSERT INTO `layers` (`nama_layer`, `tipe`, `warna`, `grup`, `urutan`, `is_active`) VALUES
('Batas Desa',        'polygon', '#292524', 'Administrasi',   1, 1),
('Wilayah RW',        'polygon', '#7c3aed', 'Administrasi',   2, 1),
('Batas Internal',    'polygon', '#525252', 'Administrasi',   3, 0),
('Pemukiman',         'polygon', '#ea580c', 'Sosial',         4, 1),
('Peralihan Hak Tanah','polygon', '#b45309', 'Tanah',          5, 0),
('Jalan',             'line',    '#ca8a04', 'Infrastruktur',  6, 1),
('Sungai',            'line',    '#0284c7', 'Infrastruktur',  7, 1),
('Irigasi',           'line',    '#06b6d4', 'Infrastruktur',  8, 0),
('Sekolah Dasar',     'point',   '#16a34a', 'Fasilitas',      9, 1),
('Tempat Ibadah',     'point',   '#8b5cf6', 'Fasilitas',      10, 1),
('Titik Batas & Landmark','point','#dc2626','Fasilitas',      11, 0);