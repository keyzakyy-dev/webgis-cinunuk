import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, getOne, insert } from '../config/db.js';

export async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username dan password wajib diisi' });
    }

    const user = await getOne('SELECT * FROM users WHERE username = ? AND role IN (?, ?)', [username, 'admin', 'editor']);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Username atau password salah' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Username atau password salah' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          nama: user.nama,
          role: user.role,
        },
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
}

export async function me(req, res) {
  res.json({
    success: true,
    data: {
      id: req.user.id,
      username: req.user.username,
      nama: req.user.nama,
      role: req.user.role,
    },
  });
}

export async function register(req, res) {
  try {
    const { username, password, nama, role } = req.body;

    if (!username || !password) {
      return res.status(422).json({ success: false, message: 'Username dan password wajib diisi' });
    }
    if (password.length < 6) {
      return res.status(422).json({ success: false, message: 'Password minimal 6 karakter' });
    }

    const existing = await getOne('SELECT id FROM users WHERE username = ?', [username]);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Username sudah digunakan' });
    }

    const hash = await bcrypt.hash(password, 10);
    const id = await insert(
      'INSERT INTO users (username, password, nama, role) VALUES (?, ?, ?, ?)',
      [username, hash, nama || username, role || 'admin']
    );

    res.status(201).json({ success: true, data: { id } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
}

export async function getUsers(req, res) {
  try {
    const users = await query('SELECT id, username, nama, role, created_at FROM users ORDER BY id');
    res.json({ success: true, data: users });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
}
