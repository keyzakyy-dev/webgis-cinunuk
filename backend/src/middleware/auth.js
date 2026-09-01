import jwt from 'jsonwebtoken';
import { getOne } from '../config/db.js';

export async function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await getOne('SELECT id, username, nama, role FROM users WHERE id = ?', [decoded.userId]);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalid atau expired' });
  }
}

export function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      req.user = null;
    } else {
      const user = await getOne('SELECT id, username, nama, role FROM users WHERE id = ?', [decoded.userId]);
      req.user = user || null;
    }
    next();
  });
}
