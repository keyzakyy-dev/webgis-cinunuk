import { query, getOne, insert, execute } from '../config/db.js';

function buildGeoJsonFeature(row) {
  const feature = {
    type: 'Feature',
    id: row.id,
    properties: {
      Name: row.nama,
      id: row.id,
    },
  };

  if (row.deskripsi) {
    feature.properties.description = row.deskripsi;
  }
  if (row.kategori) {
    feature.properties.kategori = row.kategori;
  }
  if (row.deskripsi_lengkap) {
    feature.properties.deskripsi_lengkap = row.deskripsi_lengkap;
  }
  if (row.alamat) {
    feature.properties.alamat = row.alamat;
  }
  if (row.jam_layanan) {
    feature.properties.jam_layanan = row.jam_layanan;
  }
  if (row.petunjuk_arah) {
    try {
      feature.properties.petunjuk_arah = typeof row.petunjuk_arah === 'string'
        ? JSON.parse(row.petunjuk_arah)
        : row.petunjuk_arah;
    } catch {
      feature.properties.petunjuk_arah = [];
    }
  }
  if (row.foto_1 || row.foto_2 || row.foto_3) {
    feature.properties.foto = [row.foto_1, row.foto_2, row.foto_3].filter(Boolean);
  }

  if (row.geometry) {
    try {
      feature.geometry = typeof row.geometry === 'string' ? JSON.parse(row.geometry) : row.geometry;
    } catch (e) {
      feature.geometry = null;
    }
  } else if (row.lat && row.lng) {
    feature.geometry = {
      type: 'Point',
      coordinates: [parseFloat(row.lng), parseFloat(row.lat)],
    };
  }

  return feature;
}

export async function listLayers(req, res) {
  try {
    const activeOnly = !req.query.all;
    let sql = 'SELECT l.*, (SELECT COUNT(*) FROM features f WHERE f.layer_id = l.id) AS features_count FROM layers l';
    if (activeOnly) sql += ' WHERE l.is_active = 1';
    sql += ' ORDER BY l.urutan ASC, l.id ASC';
    const rows = await query(sql);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('listLayers error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
}

export async function getLayerWithFeatures(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const layer = await getOne('SELECT * FROM layers WHERE id = ?', [id]);
    if (!layer) {
      return res.status(404).json({ success: false, message: 'Layer tidak ditemukan' });
    }

    const features = await query(
      'SELECT id, nama, deskripsi, deskripsi_lengkap, alamat, jam_layanan, petunjuk_arah, lat, lng, geometry, foto_1, foto_2, foto_3, is_active, created_at, updated_at FROM features WHERE layer_id = ? AND is_active = 1 ORDER BY id',
      [id]
    );

    const geojson = {
      type: 'FeatureCollection',
      name: layer.nama_layer,
      features: features.map(buildGeoJsonFeature),
    };

    res.json({ success: true, data: { ...layer, geojson } });
  } catch (err) {
    console.error('getLayerWithFeatures error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
}

export async function createLayer(req, res) {
  try {
    const { nama_layer, tipe, warna, grup, urutan, is_active } = req.body;
    if (!nama_layer) {
      return res.status(422).json({ success: false, errors: { nama_layer: 'Nama layer wajib diisi' } });
    }
    if (!['polygon', 'line', 'point'].includes(tipe)) {
      return res.status(422).json({ success: false, errors: { tipe: 'Tipe harus polygon, line, atau point' } });
    }
    const id = await insert(
      'INSERT INTO layers (nama_layer, tipe, warna, grup, urutan, is_active) VALUES (?, ?, ?, ?, ?, ?)',
      [nama_layer, tipe, warna || '#292524', grup || 'Lainnya', urutan || 0, is_active ?? 1]
    );
    res.status(201).json({ success: true, data: { id } });
  } catch (err) {
    console.error('createLayer error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
}

export async function updateLayer(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const { nama_layer, tipe, warna, grup, urutan, is_active } = req.body;
    if (!nama_layer) {
      return res.status(422).json({ success: false, errors: { nama_layer: 'Nama layer wajib diisi' } });
    }
    if (!['polygon', 'line', 'point'].includes(tipe)) {
      return res.status(422).json({ success: false, errors: { tipe: 'Tipe harus polygon, line, atau point' } });
    }
    const result = await execute(
      'UPDATE layers SET nama_layer=?, tipe=?, warna=?, grup=?, urutan=?, is_active=? WHERE id=?',
      [nama_layer, tipe, warna, grup, urutan, is_active, id]
    );
    res.json({ success: result.affectedRows > 0 });
  } catch (err) {
    console.error('updateLayer error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
}

export async function deleteLayer(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await execute('DELETE FROM layers WHERE id = ?', [id]);
    res.json({ success: result.affectedRows > 0 });
  } catch (err) {
    console.error('deleteLayer error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
}
