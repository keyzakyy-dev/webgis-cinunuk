import 'dotenv/config';
import pool from './src/config/db.js';

async function runMigration() {
  try {
    // 1. Tambah kolom manajemen
    console.log('Menambah kolom manajemen...');
    await pool.execute(`
      ALTER TABLE layers 
      ADD COLUMN manajemen ENUM('import','poi') NOT NULL DEFAULT 'import' AFTER tipe
    `);
    console.log('Kolom manajemen ditambah.');

    // 2. Update seed data: data wilayah = import, fasilitas = poi
    const importLayers = [
      'Batas Desa', 'Wilayah RW', 'Batas Internal', 'Pemukiman', 
      'Peralihan Hak Tanah', 'Jalan', 'Sungai', 'Irigasi', 
      'Titik Batas & Landmark'
    ];
    const poiLayers = ['Sekolah Dasar', 'Tempat Ibadah'];

    for (const name of importLayers) {
      await pool.execute('UPDATE layers SET manajemen = ? WHERE nama_layer = ?', ['import', name]);
      console.log(`  ${name} -> import`);
    }
    for (const name of poiLayers) {
      await pool.execute('UPDATE layers SET manajemen = ? WHERE nama_layer = ?', ['poi', name]);
      console.log(`  ${name} -> poi`);
    }

    // Layer Meky (user added) - default import
    await pool.execute('UPDATE layers SET manajemen = ? WHERE nama_layer = ?', ['import', 'Meky']);
    console.log('  Meky -> import');

    console.log('Seed manajemen selesai.');

    // 3. Verifikasi
    const [rows] = await pool.execute('SELECT id, nama_layer, tipe, manajemen FROM layers ORDER BY urutan');
    console.log('\nHasil:');
    rows.forEach(r => console.log(`  [${r.id}] ${r.nama_layer} (${r.tipe}) -> ${r.manajemen}`));

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

runMigration();