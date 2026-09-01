import mysql from 'mysql2/promise';

(async () => {
  const c = await mysql.createConnection({ host: 'localhost', port: 3306, user: 'root', database: 'sig_cinunuk' });
  await c.execute("UPDATE layers SET manajemen='import' WHERE nama_layer LIKE '%Titik Batas%'");
  console.log('Titik Batas & Landmark -> import');
  const [rows] = await c.query('SELECT id, nama_layer, tipe, manajemen FROM layers ORDER BY urutan');
  rows.forEach(r => console.log(`  [${r.id}] ${r.nama_layer} (${r.tipe}) -> ${r.manajemen}`));
  await c.end();
})();
