import 'dotenv/config';
import pool from './src/config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const polygonDir = path.resolve(__dirname, '../polygon');
const mapFileToLayer = {
  'desa cinunuk panjang jalan.geojson': 'Jalan',
  'desa cinunuk panjang sungai.geojson': 'Sungai',
  'desa cinunuk irigasi.geojson': 'Irigasi',
};

async function run() {
  let totalImported = 0;

  for (const [file, layerName] of Object.entries(mapFileToLayer)) {
    const filePath = path.join(polygonDir, file);
    if (!fs.existsSync(filePath)) {
      console.log(`  ${file} tidak ditemukan, dilewati`);
      continue;
    }

    const raw = fs.readFileSync(filePath, 'utf-8');
    let geojson;
    try {
      geojson = JSON.parse(raw);
    } catch {
      console.log(`  Gagal parse ${file}`);
      continue;
    }

    const [layerRows] = await pool.query('SELECT id FROM layers WHERE nama_layer = ?', [layerName]);
    if (layerRows.length === 0) {
      console.log(`  Layer ${layerName} tidak ditemukan, dilewati`);
      continue;
    }
    const layerId = layerRows[0].id;

    let count = 0;
    for (const feat of geojson.features || []) {
      // Hanya impor fitur dengan geometri LineString
      if (feat.geometry?.type !== 'LineString') continue;

      const props = feat.properties || {};
      const geom = feat.geometry;
      let lat = null, lng = null;

      if (geom.type === 'LineString' && Array.isArray(geom.coordinates)) {
        // Rata-rata koordinat garis
        const total = geom.coordinates.length;
        let sumLat = 0, sumLng = 0;
        for (const c of geom.coordinates) {
          sumLng += parseFloat(c[0]);
          sumLat += parseFloat(c[1]);
        }
        lng = sumLng / total;
        lat = sumLat / total;
      }

      await pool.query(
        'INSERT INTO features (layer_id, nama, deskripsi, lat, lng, geometry, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)',
        [
          layerId,
          props.Name || props.name || 'Tanpa Nama',
          props.description || null,
          lat,
          lng,
          geom ? JSON.stringify(geom) : null,
        ]
      );
      count++;
    }
    console.log(`  ${file} → ${layerName}: ${count} fitur (line only)`);
    totalImported += count;
  }

  console.log(`\nTotal fitur line berhasil diimport: ${totalImported}`);

  // Verifikasi
  const [after] = await pool.execute(
    `SELECT l.nama_layer, l.tipe, COUNT(f.id) AS jumlah
     FROM layers l LEFT JOIN features f ON f.layer_id = l.id
     GROUP BY l.id ORDER BY l.urutan`
  );
  console.log('\nSisa data per layer:');
  after.forEach(r => console.log(`  ${r.nama_layer} (${r.tipe}) -> ${r.jumlah}`));
}
run();