import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'sig_cinunuk',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

export async function query(sql, params) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

export async function getOne(sql, params) {
  const rows = await query(sql, params);
  return rows[0] || null;
}

export async function insert(sql, params) {
  const [result] = await pool.execute(sql, params);
  return result.insertId;
}

export async function execute(sql, params) {
  const [result] = await pool.execute(sql, params);
  return result;
}

export default pool;
