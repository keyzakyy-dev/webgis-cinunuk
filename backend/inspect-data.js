import 'dotenv/config';
import pool from './src/config/db.js';

async function inspect() {
  const [rows] = await pool.execute(`
    SELECT l.id, l.nama_layer, l.tipe, COUNT(f.id) AS jumlah
    FROM layers l LEFT JOIN features f ON f.layer_id = l.id AND f.is_active = 1
    GROUP BY l.id ORDER BY l.urutan
  `);
  console.log('Data sekarang:');
  rows.forEach(r => console.log(`  [${r.id}] ${r.nama_layer} (${r.tipe}) -> ${r.jumlah}`));
  await pool.end();
}
inspect();