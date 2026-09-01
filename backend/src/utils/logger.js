import { insert, query } from '../config/db.js';

export async function logActivity(username = 'Admin', action, details = '') {
  try {
    await insert(
      'INSERT INTO activity_logs (user_name, action, details) VALUES (?, ?, ?)',
      [username, action, typeof details === 'object' ? JSON.stringify(details) : String(details)]
    );
  } catch (err) {
    console.error('Failed to log activity:', err.message);
  }
}

export async function getRecentLogs(limit = 10) {
  try {
    return await query(
      'SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT ?',
      [limit]
    );
  } catch (err) {
    console.error('Failed to get logs:', err.message);
    return [];
  }
}
