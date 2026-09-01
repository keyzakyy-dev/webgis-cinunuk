import { query, getOne, insert, execute } from '../config/db.js';

export async function listFeatures(req, res) {
  try {
    const layerId = req.query.layer_id ? parseInt(req.query.layer_id, 10) : null;
    const includeInactive = req.query.include_inactive === '1';

    const conditions = [];
    const params = [];

    if (layerId) {
      conditions.push('f.layer_id = ?');
      params.push(layerId);
    }
    // Endpoint publik hanya menampilkan fitur yang aktif,
    // kecuali admin meminta semua data dengan ?include_inactive=1
    if (!includeInactive) {
      conditions.push('f.is_active = 1');
    }

    let sql = 'SELECT f.*, l.nama_layer AS layer_name, l.tipe AS layer_type FROM features f JOIN layers l ON f.layer_id = l.id';
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY l.urutan, f.nama';

    const rows = await query(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('listFeatures error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
}

export async function getFeature(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const row = await getOne(
      'SELECT f.*, l.nama_layer AS layer_name, l.tipe AS layer_type, l.warna AS layer_warna FROM features f JOIN layers l ON f.layer_id = l.id WHERE f.id = ?',
      [id]
    );
    if (!row) {
      return res.status(404).json({ success: false, message: 'Fitur tidak ditemukan' });
    }
    res.json({ success: true, data: row });
  } catch (err) {
    console.error('getFeature error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
}

export async function createFeature(req, res) {
  try {
    const d = req.body;
    if (!d.layer_id) {
      return res.status(422).json({ success: false, errors: { layer_id: 'layer_id wajib diisi' } });
    }
    if (!d.nama) {
      return res.status(422).json({ success: false, errors: { nama: 'Nama wajib diisi' } });
    }

    const petunjuk = d.petunjuk_arah ? JSON.stringify(d.petunjuk_arah) : null;
    const geometry = d.geometry && typeof d.geometry === 'object' ? JSON.stringify(d.geometry) : d.geometry || null;

    const id = await insert(
      `INSERT INTO features
        (layer_id, nama, deskripsi, deskripsi_lengkap, alamat, jam_layanan, petunjuk_arah,
         lat, lng, geometry, foto_1, foto_2, foto_3, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        d.layer_id,
        d.nama,
        d.deskripsi || null,
        d.deskripsi_lengkap || null,
        d.alamat || null,
        d.jam_layanan || null,
        petunjuk,
        d.lat || null,
        d.lng || null,
        geometry,
        d.foto_1 || null,
        d.foto_2 || null,
        d.foto_3 || null,
        d.is_active ?? 1,
      ]
    );
    res.status(201).json({ success: true, data: { id } });
  } catch (err) {
    console.error('createFeature error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
}

export async function updateFeature(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const d = req.body;
    if (!d.layer_id) {
      return res.status(422).json({ success: false, errors: { layer_id: 'layer_id wajib diisi' } });
    }
    if (!d.nama) {
      return res.status(422).json({ success: false, errors: { nama: 'Nama wajib diisi' } });
    }

    const petunjuk = d.petunjuk_arah ? JSON.stringify(d.petunjuk_arah) : null;
    const geometry = d.geometry && typeof d.geometry === 'object' ? JSON.stringify(d.geometry) : d.geometry || null;

    const result = await execute(
      `UPDATE features SET
        layer_id=?, nama=?, deskripsi=?, deskripsi_lengkap=?, alamat=?, jam_layanan=?,
        petunjuk_arah=?, lat=?, lng=?, geometry=?, foto_1=?, foto_2=?, foto_3=?, is_active=?,
        updated_at=NOW()
       WHERE id=?`,
      [
        d.layer_id,
        d.nama,
        d.deskripsi || null,
        d.deskripsi_lengkap || null,
        d.alamat || null,
        d.jam_layanan || null,
        petunjuk,
        d.lat || null,
        d.lng || null,
        geometry,
        d.foto_1 || null,
        d.foto_2 || null,
        d.foto_3 || null,
        d.is_active ?? 1,
        id,
      ]
    );
    res.json({ success: result.affectedRows > 0 });
  } catch (err) {
    console.error('updateFeature error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
}

export async function deleteFeature(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await execute('DELETE FROM features WHERE id = ?', [id]);
    res.json({ success: result.affectedRows > 0 });
  } catch (err) {
    console.error('deleteFeature error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
}

export async function importFeatures(req, res) {
  try {
    if (!req.file) {
      return res.status(422).json({ success: false, message: 'File GeoJSON wajib diisi' });
    }
    const layerId = parseInt(req.body.layer_id, 10);
    if (!layerId) {
      return res.status(422).json({ success: false, message: 'layer_id wajib diisi' });
    }

    const content = req.file.buffer.toString('utf-8');
    let geojson;
    try {
      geojson = JSON.parse(content);
    } catch (e) {
      return res.status(422).json({ success: false, message: 'Format GeoJSON tidak valid' });
    }
    if (!geojson.features) {
      return res.status(422).json({ success: false, message: 'Format GeoJSON tidak valid (FeatureCollection diperlukan)' });
    }

    let count = 0;
    for (const feat of geojson.features) {
      const props = feat.properties || {};
      const geom = feat.geometry || null;
      let lat = null, lng = null;

      if (geom) {
        if (geom.type === 'Point' && Array.isArray(geom.coordinates)) {
          lng = geom.coordinates[0];
          lat = geom.coordinates[1];
        } else if (Array.isArray(geom.coordinates) && Array.isArray(geom.coordinates[0])) {
          const first = geom.coordinates[0];
          if (Array.isArray(first) && first.length >= 3) {
            const total = first.length;
            let sumLat = 0, sumLng = 0;
            for (const c of first) {
              sumLng += parseFloat(c[0]);
              sumLat += parseFloat(c[1]);
            }
            lng = sumLng / total;
            lat = sumLat / total;
          }
        }
      }

      await insert(
        `INSERT INTO features (layer_id, nama, deskripsi, lat, lng, geometry, is_active)
         VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [
          layerId,
          props.Name || props.name || 'Tanpa Nama',
          props.description || null,
          lat,
          lng,
          geom ? JSON.stringify(geom) : null,
        ]
      );
      count++;
    }
    res.json({ success: true, data: { imported: count } });
  } catch (err) {
    console.error('importFeatures error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
}
