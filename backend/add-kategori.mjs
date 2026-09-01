import mysql from 'mysql2/promise';

(async () => {
  const c = await mysql.createConnection({ host: 'localhost', port: 3306, user: 'root', database: 'sig_cinunuk' });
  const [cols] = await c.query('SHOW COLUMNS FROM features');
  const has = cols.some(x => x.Field === 'kategori');
  if (!has) {
    await c.execute("ALTER TABLE features ADD COLUMN kategori VARCHAR(60) NULL AFTER layer_id");
    console.log('kolom kategori ditambahkan');
  } else {
    console.log('kolom kategori sudah ada');
  }
  await c.end();
})();
