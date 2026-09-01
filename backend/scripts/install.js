import 'dotenv/config';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const {
  DB_HOST = 'localhost',
  DB_PORT = 3306,
  DB_USER = 'root',
  DB_PASS = '',
  DB_NAME = 'sig_cinunuk',
} = process.env;

const isCloud = process.env.DB_SSL === 'true' || DB_HOST.includes('aivencloud');

const connConfig = {
  host: DB_HOST,
  port: parseInt(DB_PORT, 10),
  user: DB_USER,
  password: DB_PASS,
  multipleStatements: true,
  ...(isCloud ? { ssl: { rejectUnauthorized: false } } : {}),
};

// Sertakan database langsung jika Aiven atau database sudah ditentukan
if (isCloud || DB_NAME === 'defaultdb') {
  connConfig.database = DB_NAME;
}

const conn = await mysql.createConnection(connConfig);

console.log('─ Instalasi SIG Cinunuk (Node.js + Express + MySQL) ─');
console.log(`   Host: ${DB_HOST}:${DB_PORT} (${isCloud ? 'Cloud SSL' : 'Lokal'})`);
console.log(`   Database Target: ${DB_NAME}`);

async function step1CreateTables() {
  console.log('\n[1/3] Membuat database & tabel...');
  
  if (!isCloud && DB_NAME !== 'defaultdb') {
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await conn.query(`USE \`${DB_NAME}\``);
  } else {
    await conn.query(`USE \`${DB_NAME}\``);
  }

  await conn.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      username VARCHAR(60) NOT NULL,
      password VARCHAR(255) NOT NULL,
      nama VARCHAR(100) NULL,
      role ENUM('admin','editor') NOT NULL DEFAULT 'admin',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY u_username (username)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS layers (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      nama_layer VARCHAR(100) NOT NULL,
      tipe ENUM('polygon','line','point') NOT NULL DEFAULT 'point',
      warna VARCHAR(7) NOT NULL DEFAULT '#292524',
      grup VARCHAR(50) NOT NULL DEFAULT 'Lainnya',
      urutan INT NOT NULL DEFAULT 0,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      manajemen VARCHAR(20) NOT NULL DEFAULT 'import',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS features (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      layer_id INT UNSIGNED NOT NULL,
      kategori VARCHAR(100) NULL,
      nama VARCHAR(200) NOT NULL,
      deskripsi TEXT NULL,
      deskripsi_lengkap TEXT NULL,
      alamat VARCHAR(255) NULL,
      jam_layanan VARCHAR(100) NULL,
      petunjuk_arah TEXT NULL,
      lat DECIMAL(11,8) NULL,
      lng DECIMAL(11,8) NULL,
      geometry LONGTEXT NULL,
      foto_1 VARCHAR(255) NULL,
      foto_2 VARCHAR(255) NULL,
      foto_3 VARCHAR(255) NULL,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NULL,
      PRIMARY KEY (id),
      KEY i_layer (layer_id),
      CONSTRAINT fk_feature_layer FOREIGN KEY (layer_id) REFERENCES layers (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_name VARCHAR(60) NOT NULL DEFAULT 'Admin',
      action VARCHAR(100) NOT NULL,
      details TEXT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  console.log('   Tabel users, layers, features, activity_logs siap.');
}

async function step2SeedLayers() {
  console.log('\n[2/3] Seeding layer default...');
  const [existing] = await conn.query('SELECT COUNT(*) AS total FROM layers');
  if (existing[0].total > 0) {
    console.log('   Layer sudah ada, dilewati.');
    return;
  }

  const layers = [
    ['Batas Desa', 'polygon', '#292524', 'Administrasi', 1, 1],
    ['Wilayah RW', 'polygon', '#7c3aed', 'Administrasi', 2, 1],
    ['Batas Internal', 'polygon', '#525252', 'Administrasi', 3, 0],
    ['Pemukiman', 'polygon', '#ea580c', 'Sosial', 4, 1],
    ['Peralihan Hak Tanah', 'polygon', '#b45309', 'Tanah', 5, 0],
    ['Jalan', 'line', '#ca8a04', 'Infrastruktur', 6, 1],
    ['Sungai', 'line', '#0284c7', 'Infrastruktur', 7, 1],
    ['Irigasi', 'line', '#06b6d4', 'Infrastruktur', 8, 0],
    ['Sekolah Dasar', 'point', '#16a34a', 'Fasilitas', 9, 1],
    ['Tempat Ibadah', 'point', '#8b5cf6', 'Fasilitas', 10, 1],
    ['Titik Batas & Landmark', 'point', '#dc2626', 'Fasilitas', 11, 0],
  ];

  for (const l of layers) {
    await conn.query(
      'INSERT INTO layers (nama_layer, tipe, warna, grup, urutan, is_active) VALUES (?, ?, ?, ?, ?, ?)',
      l
    );
  }
  console.log(`   ${layers.length} layer disisipkan.`);
}

async function step3CreateAdmin() {
  console.log('\n[3/3] Membuat akun admin...');
  const username = process.env.ADMIN_USER || 'admin';
  const password = process.env.ADMIN_PASS || 'admin123';
  const nama = process.env.ADMIN_NAMA || 'Administrator Sig Cinunuk';

  const [existing] = await conn.query('SELECT COUNT(*) AS total FROM users WHERE username = ?', [username]);
  if (existing[0].total > 0) {
    console.log(`   Akun '${username}' sudah ada, dilewati.`);
    return;
  }

  const hash = await bcrypt.hash(password, 10);
  await conn.query(
    'INSERT INTO users (username, password, nama, role) VALUES (?, ?, ?, ?)',
    [username, hash, nama, 'admin']
  );
  console.log(`   Akun '${username}' dibuat.`);
  console.log('   USERNAME: ' + username);
  console.log('   PASSWORD: ' + password);
}

async function seedFeatures() {
  const polygonDir = path.resolve(__dirname, '../../polygon');
  const mapFileToLayer = {
    'desa cinunuk.geojson': 'Batas Desa',
    'desa cinunuk wilayah rw.geojson': 'Wilayah RW',
    'desa cinunuk pemukiman.geojson': 'Pemukiman',
    'desa cinunuk peralihan hak atas tanah.geojson': 'Peralihan Hak Tanah',
    'desa cinunuk panjang jalan.geojson': 'Jalan',
    'desa cinunuk panjang sungai.geojson': 'Sungai',
    'desa cinunuk irigasi.geojson': 'Irigasi',
    'desa cinunuk sekolah dasar.geojson': 'Sekolah Dasar',
    'desa cinunuk mesjid dan mushola.geojson': 'Tempat Ibadah',
    'desa cinunuk koordinat batas desa.geojson': 'Titik Batas & Landmark',
  };

  const [existing] = await conn.query('SELECT COUNT(*) AS total FROM features');
  if (existing[0].total > 0) {
    console.log('   Fitur sudah ada, dilewati.');
    return;
  }

  console.log('\n(opsional) Meng-import GeoJSON dari folder polygon/ ...');
  let totalImported = 0;

  for (const [file, layerName] of Object.entries(mapFileToLayer)) {
    const filePath = path.join(polygonDir, file);
    if (!fs.existsSync(filePath)) continue;

    const raw = fs.readFileSync(filePath, 'utf-8');
    let geojson;
    try {
      geojson = JSON.parse(raw);
    } catch {
      console.log(`   Gagal parse ${file}`);
      continue;
    }

    const [layerRows] = await conn.query('SELECT id FROM layers WHERE nama_layer = ?', [layerName]);
    if (layerRows.length === 0) continue;
    const layerId = layerRows[0].id;

    let count = 0;
    for (const feat of geojson.features || []) {
      const props = feat.properties || {};
      const geom = feat.geometry || null;
      let lat = null, lng = null;

      if (geom) {
        if (geom.type === 'Point' && Array.isArray(geom.coordinates)) {
          lng = geom.coordinates[0];
          lat = geom.coordinates[1];
        } else if (Array.isArray(geom.coordinates) && Array.isArray(geom.coordinates[0])) {
          const first = geom.coordinates[0];
          if (Array.isArray(first) && first.length >= 3) {
            const total = first.length;
            let sumLat = 0, sumLng = 0;
            for (const c of first) {
              sumLng += parseFloat(c[0]);
              sumLat += parseFloat(c[1]);
            }
            const rawLng = sumLng / total;
            const rawLat = sumLat / total;
            lng = isNaN(rawLng) ? null : rawLng;
            lat = isNaN(rawLat) ? null : rawLat;
          }
        }
      }

      await conn.query(
        'INSERT INTO features (layer_id, nama, deskripsi, lat, lng, geometry, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)',
        [
          layerId,
          props.Name || props.name || 'Tanpa Nama',
          props.description || null,
          lat ?? null,
          lng ?? null,
          geom ? JSON.stringify(geom) : null,
        ]
      );
      count++;
    }
    console.log(`   ${file} → ${layerName}: ${count} fitur`);
    totalImported += count;
  }
  console.log(`   Total fitur diimport: ${totalImported}`);
}

try {
  await step1CreateTables();
  await step2SeedLayers();
  await step3CreateAdmin();

  const doSeedFeatures = process.env.SEED_FEATURES === '1' || process.argv.includes('--features');
  if (doSeedFeatures) {
    await seedFeatures();
  }

  console.log('\n✔ Instalasi selesai.');
} catch (err) {
  console.error('\n✘ Instalasi gagal:', err.message);
  process.exit(1);
} finally {
  await conn.end();
}
