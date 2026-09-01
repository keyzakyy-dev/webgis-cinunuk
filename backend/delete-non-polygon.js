import 'dotenv/config';
import pool from './src/config/db.js';

async function run() {
  try {
    const [before] = await pool.execute(
      "SELECT COUNT(*) AS total FROM features WHERE layer_id IN (SELECT id FROM layers WHERE tipe != 'polygon')"
    );
    console.log(`Fitur non-polygon yang akan dihapus: ${before[0].total}`);

    await pool.execute(
      "DELETE FROM features WHERE layer_id IN (SELECT id FROM layers WHERE tipe != 'polygon')"
    );

    const [after] = await pool.execute(
      `SELECT l.nama_layer, l.tipe, COUNT(f.id) AS jumlah
       FROM layers l LEFT JOIN features f ON f.layer_id = l.id
       GROUP BY l.id ORDER BY l.urutan`
    );
    console.log('\nSisa data:');
    after.forEach(r => console.log(`  ${r.nama_layer} (${r.tipe}) -> ${r.jumlah}`));
    console.log('\nSelesai.');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}
run();