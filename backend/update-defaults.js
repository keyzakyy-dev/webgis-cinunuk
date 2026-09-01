import 'dotenv/config';
import pool from './src/config/db.js';

async function run() {
  try {
    // Set default active layers: Batas Desa, Jalan, Sungai, Irigasi
    await pool.execute("UPDATE layers SET is_active = 1 WHERE nama_layer IN ('Batas Desa','Jalan','Sungai','Irigasi')");
    await pool.execute("UPDATE layers SET is_active = 0 WHERE nama_layer NOT IN ('Batas Desa','Jalan','Sungai','Irigasi')");
    
    const [rows] = await pool.execute("SELECT id, nama_layer, tipe, is_active FROM layers ORDER BY urutan");
    console.log('Default active layers updated:');
    rows.forEach(r => console.log(`  [${r.id}] ${r.nama_layer} (${r.tipe}) -> is_active=${r.is_active}`));
  } catch (err) { console.error(err.message); }
  finally { await pool.end(); }
}
run();