import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import layerRoutes from './routes/layerRoutes.js';
import featureRoutes from './routes/featureRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import logRoutes from './routes/logRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://localhost:4173'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API OK' });
});

app.use('/api/auth', authRoutes);
app.use('/api/layers', layerRoutes);
app.use('/api/features', featureRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/logs', logRoutes);

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ success: false, message: 'JSON tidak valid' });
  }
  if (err.message && err.message.includes('Ekstensi file')) {
    return res.status(422).json({ success: false, message: err.message });
  }
  res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' });
});

app.listen(PORT, () => {
  console.log(`SIG Cinunuk API running on http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
});

export default app;
