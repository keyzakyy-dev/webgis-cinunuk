import { Router } from 'express';
import { query } from '../config/db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const [layerRow] = await query(
      'SELECT COUNT(*) AS total, SUM(is_active) AS aktif FROM layers'
    );
    const [featureRow] = await query('SELECT COUNT(*) AS total FROM features');
    const [pointRow] = await query(
      "SELECT COUNT(*) AS total FROM features f JOIN layers l ON f.layer_id = l.id WHERE l.tipe = 'point' AND f.is_active = 1"
    );
    const groupRows = await query(
      `SELECT l.nama_layer, l.tipe, l.warna, l.is_active, COUNT(f.id) AS jumlah
       FROM layers l LEFT JOIN features f ON f.layer_id = l.id AND f.is_active = 1
       GROUP BY l.id ORDER BY l.urutan`
    );

    const byName = {};
    for (const r of groupRows) byName[r.nama_layer.toLowerCase()] = r.jumlah;

    const statistik = [
      { label: 'Total Fitur', nilai: String(featureRow?.total || 0), satuan: 'Fitur' },
      { label: 'Titik Lokasi', nilai: String(pointRow?.total || 0), satuan: 'POI' },
      { label: 'Wilayah RW', nilai: String(byName['wilayah rw'] ?? 0), satuan: 'RW' },
      { label: 'Jaringan Jalan', nilai: String(byName['jalan'] ?? 0), satuan: 'Rute' },
    ];

    res.json({
      success: true,
      data: {
        totalLayer: Number(layerRow?.total || 0),
        aktifLayer: Number(layerRow?.aktif || 0),
        totalFitur: Number(featureRow?.total || 0),
        titikLokasi: Number(pointRow?.total || 0),
        perLayer: groupRows,
        byName,
        statistik,
      },
    });
  } catch (err) {
    console.error('stats error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
});

export default router;
