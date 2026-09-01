import mysql from 'mysql2/promise';

(async () => {
  const c = await mysql.createConnection({ host: 'localhost', port: 3306, user: 'root', database: 'sig_cinunuk' });
  await c.execute("ALTER TABLE layers ADD COLUMN manajemen ENUM('import','poi') NOT NULL DEFAULT 'import' AFTER tipe");
  console.log('kolom manajemen ditambahkan');

  const importNames = ['Batas Desa','Wilayah RW','Pemukiman','Peralihan Hak Tanah','Jalan','Sungai','Irigasi','Titik Batas & Landmark'];
  const poiNames = ['Sekolah Dasar','Tempat Ibadah'];

  for (const name of importNames) {
    await c.execute("UPDATE layers SET manajemen='import' WHERE nama_layer=?", [name]);
  }
  for (const name of poiNames) {
    await c.execute("UPDATE layers SET manajemen='poi' WHERE nama_layer=?", [name]);
  }
  console.log('seed manajemen selesai');

  const [rows] = await c.query("SELECT id, nama_layer, tipe, manajemen FROM layers ORDER BY urutan");
  rows.forEach(r => console.log(' ', r.id, r.nama_layer, r.tipe, r.manajemen));
  await c.end();
})();
