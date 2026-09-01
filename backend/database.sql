-- =====================================================================
--  Database GIS Desa Cinunuk (MySQL / MariaDB)
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
  `kategori`         VARCHAR(100) NULL,
  `nama`             VARCHAR(200) NOT NULL,
  `deskripsi`        TEXT NULL,
  `deskripsi_lengkap` TEXT NULL,
  `alamat`           VARCHAR(255) NULL,
  `jam_layanan`      VARCHAR(100) NULL,
  `petunjuk_arah`    TEXT NULL,
  `lat`              DECIMAL(11,8) NULL,
  `lng`              DECIMAL(11,8) NULL,
  `geometry`         LONGTEXT NULL,
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

-- ---------------------------------------------------------------------
-- Tabel: activity_logs (catatan riwayat aktivitas admin)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_name`  VARCHAR(60) NOT NULL DEFAULT 'Admin',
  `action`     VARCHAR(100) NOT NULL,
  `details`    TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
