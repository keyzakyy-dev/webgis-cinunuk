import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const polygonDir = path.resolve(__dirname, '../polygon');

const mapFileToLayer = {
  'desa cinunuk sekolah dasar.geojson': { name: 'Sekolah Dasar', tipe: 'point', warna: '#16a34a', grup: 'Fasilitas', urutan: 9, manajemen: 'poi' },
  'desa cinunuk mesjid dan mushola.geojson': { name: 'Tempat Ibadah', tipe: 'point', warna: '#8b5cf6', grup: 'Fasilitas', urutan: 10, manajemen: 'poi' },
  'desa cinunuk koordinat batas desa.geojson': { name: 'Titik Batas & Landmark', tipe: 'point', warna: '#dc2626', grup: 'Fasilitas', urutan: 11, manajemen: 'poi' },
};

async function run() {
  const c = await mysql.createConnection({ host: 'localhost', port: 3306, user: 'root', database: 'sig_cinunuk' });

  for (const [file, meta] of Object.entries(mapFileToLayer)) {
    const filePath = path.join(polygonDir, file);
    if (!fs.existsSync(filePath)) {
      console.log(`  ${file} tidak ditemukan, dilewati`);
      continue;
    }

    // Buat layer jika belum ada
    let [layerRows] = await c.query('SELECT id FROM layers WHERE nama_layer = ?', [meta.name]);
    let layerId;
    if (layerRows.length === 0) {
      const [nextRow] = await c.query('SELECT COALESCE(MAX(urutan), 0) + 1 AS next FROM layers');
      const id = await c.query(
        "INSERT INTO layers (nama_layer, tipe, warna, grup, urutan, is_active, manajemen) VALUES (?, ?, ?, ?, ?, 1, ?)",
        [meta.name, meta.tipe, meta.warna, meta.grup, meta.urutan, meta.manajemen]
      );
      layerId = id[0].insertId;
      console.log(`  Layer ${meta.name} dibuat (id: ${layerId})`);
    } else {
      layerId = layerRows[0].id;
    }

    // Import features
    const raw = fs.readFileSync(filePath, 'utf-8');
    let geojson;
    try { geojson = JSON.parse(raw); } catch { console.log(`  Gagal parse ${file}`); continue; }

    let count = 0;
    for (const feat of geojson.features || []) {
      if (feat.geometry?.type !== 'Point') continue;
      const props = feat.properties || {};
      const coords = feat.geometry.coordinates;
      const lng = parseFloat(coords[0]);
      const lat = parseFloat(coords[1]);
      await c.query(
        'INSERT INTO features (layer_id, kategori, nama, deskripsi, lat, lng, geometry, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
        [
          layerId,
          meta.name.includes('Sekolah') ? 'Fasilitas Sekolah' : 
          meta.name.includes('Ibadah') ? 'Tempat Ibadah' : 'Fasilitas Umum',
          props.Name || props.name || 'Tanpa Nama',
          props.description || null,
          lat, lng,
          JSON.stringify(feat.geometry),
        ]
      );
      count++;
    }
    console.log(`  ${file} → ${meta.name}: ${count} fitur point`);
  }

  // Verify
  const [layers] = await c.query('SELECT id, nama_layer, tipe, manajemen, is_active FROM layers ORDER BY urutan');
  layers.forEach(l => console.log(`  [${l.id}] ${l.nama_layer} (${l.tipe}) -> ${l.manajemen} active=${l.is_active}`));

  const [feats] = await c.query('SELECT layer_id, COUNT(*) c FROM features WHERE is_active=1 GROUP BY layer_id');
  feats.forEach(f => console.log(`  layer_id ${f.layer_id}: ${f.c} fitur`));

  await c.end();
}
run();