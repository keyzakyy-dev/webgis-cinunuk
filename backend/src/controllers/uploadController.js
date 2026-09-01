import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const UPLOAD_DIR = path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'public/uploads');
const MAX_SIZE = parseInt(process.env.MAX_UPLOAD_SIZE, 10) || 5 * 1024 * 1024;

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const sub = (req.body?.subfolder || 'poi').replace(/[^a-z0-9\-\/]/gi, '');
    const dir = path.join(UPLOAD_DIR, sub);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const rand = crypto.randomBytes(4).toString('hex');
    cb(null, `${stamp}_${rand}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).slice(1).toLowerCase();
  const allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('Ekstensi file tidak diizinkan: ' + ext));
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE },
});

const geojsonStorage = multer.memoryStorage();
export const uploadGeojson = multer({
  storage: geojsonStorage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).slice(1).toLowerCase();
    if (ext === 'geojson' || ext === 'json') cb(null, true);
    else cb(new Error('Hanya file .geojson atau .json yang diizinkan'));
  },
  limits: { fileSize: MAX_SIZE },
});

export function handleUpload(req, res) {
  try {
    if (!req.file) {
      return res.status(422).json({ success: false, message: 'File wajib diisi' });
    }
    const sub = (req.body?.subfolder || 'poi').replace(/[^a-z0-9\-\/]/gi, '');
    const url = `/uploads/${sub}/${req.file.filename}`;
    res.json({
      success: true,
      data: {
        url,
        filename: req.file.filename,
        size: req.file.size,
      },
    });
  } catch (err) {
    console.error('handleUpload error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
}
