import { Router } from 'express';
import { getRecentLogs } from '../utils/logger.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const logs = await getRecentLogs(limit);
    res.json({ success: true, data: logs });
  } catch (err) {
    console.error('logRoutes error:', err);
    res.status(500).json({ success: false, message: 'Gagal memuat log' });
  }
});

export default router;
