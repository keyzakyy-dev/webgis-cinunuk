import { query, getOne, insert, execute } from '../config/db.js';
import { logActivity } from '../utils/logger.js';

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

    let sql = 'SELECT f.*, l.nama_layer AS layer_name, l.tipe AS layer_type, l.manajemen AS layer_manajemen FROM features f JOIN layers l ON f.layer_id = l.id';
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
      'SELECT f.*, l.nama_layer AS layer_name, l.tipe AS layer_type, l.warna AS layer_warna, l.manajemen AS layer_manajemen FROM features f JOIN layers l ON f.layer_id = l.id WHERE f.id = ?',
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
      return res.status(422).json({ success: false, message: 'Layer tujuan wajib dipilih' });
    }
    if (!d.nama || !String(d.nama).trim()) {
      return res.status(422).json({ success: false, message: 'Nama fitur/lokasi wajib diisi' });
    }

    const layerId = parseInt(d.layer_id, 10);
    if (isNaN(layerId) || layerId <= 0) {
      return res.status(422).json({ success: false, message: 'Layer tidak valid' });
    }

    const layer = await getOne('SELECT id FROM layers WHERE id = ?', [layerId]);
    if (!layer) {
      return res.status(422).json({ success: false, message: 'Layer yang dipilih tidak ditemukan di database' });
    }

    const lat = d.lat != null && d.lat !== '' && !isNaN(parseFloat(d.lat)) ? parseFloat(d.lat) : null;
    const lng = d.lng != null && d.lng !== '' && !isNaN(parseFloat(d.lng)) ? parseFloat(d.lng) : null;

    let geometry = null;
    if (d.geometry && typeof d.geometry === 'object') {
      geometry = JSON.stringify(d.geometry);
    } else if (typeof d.geometry === 'string' && d.geometry.trim()) {
      geometry = d.geometry.trim();
    } else if (lat !== null && lng !== null) {
      geometry = JSON.stringify({ type: 'Point', coordinates: [lng, lat] });
    }

    let petunjuk = null;
    if (Array.isArray(d.petunjuk_arah)) {
      petunjuk = JSON.stringify(d.petunjuk_arah.filter((p) => p && String(p).trim()));
    } else if (d.petunjuk_arah) {
      petunjuk = typeof d.petunjuk_arah === 'string' ? d.petunjuk_arah : JSON.stringify(d.petunjuk_arah);
    }

    const id = await insert(
      `INSERT INTO features
        (layer_id, kategori, nama, deskripsi, deskripsi_lengkap, alamat, jam_layanan, petunjuk_arah,
         lat, lng, geometry, foto_1, foto_2, foto_3, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        layerId,
        d.kategori ? String(d.kategori).trim() : null,
        String(d.nama).trim(),
        d.deskripsi ? String(d.deskripsi).trim() : null,
        d.deskripsi_lengkap ? String(d.deskripsi_lengkap).trim() : null,
        d.alamat ? String(d.alamat).trim() : null,
        d.jam_layanan ? String(d.jam_layanan).trim() : null,
        petunjuk,
        lat,
        lng,
        geometry,
        d.foto_1 || null,
        d.foto_2 || null,
        d.foto_3 || null,
        d.is_active != null ? (d.is_active ? 1 : 0) : 1,
      ]
    );
    await logActivity(req.user?.username || 'Admin', 'Tambah Fitur', `Membuat fitur "${String(d.nama).trim()}" di layer ${layerId}`);
    res.status(201).json({ success: true, data: { id } });
  } catch (err) {
    console.error('createFeature error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server: ' + (err.message || '') });
  }
}

export async function updateFeature(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(422).json({ success: false, message: 'ID fitur tidak valid' });
    }

    const d = req.body;
    if (!d.layer_id) {
      return res.status(422).json({ success: false, message: 'Layer tujuan wajib dipilih' });
    }
    if (!d.nama || !String(d.nama).trim()) {
      return res.status(422).json({ success: false, message: 'Nama fitur/lokasi wajib diisi' });
    }

    const layerId = parseInt(d.layer_id, 10);
    if (isNaN(layerId) || layerId <= 0) {
      return res.status(422).json({ success: false, message: 'Layer tidak valid' });
    }

    const layer = await getOne('SELECT id FROM layers WHERE id = ?', [layerId]);
    if (!layer) {
      return res.status(422).json({ success: false, message: 'Layer yang dipilih tidak ditemukan di database' });
    }

    const lat = d.lat != null && d.lat !== '' && !isNaN(parseFloat(d.lat)) ? parseFloat(d.lat) : null;
    const lng = d.lng != null && d.lng !== '' && !isNaN(parseFloat(d.lng)) ? parseFloat(d.lng) : null;

    let geometry = null;
    if (d.geometry && typeof d.geometry === 'object') {
      geometry = JSON.stringify(d.geometry);
    } else if (typeof d.geometry === 'string' && d.geometry.trim()) {
      geometry = d.geometry.trim();
    } else if (lat !== null && lng !== null) {
      geometry = JSON.stringify({ type: 'Point', coordinates: [lng, lat] });
    }

    let petunjuk = null;
    if (Array.isArray(d.petunjuk_arah)) {
      petunjuk = JSON.stringify(d.petunjuk_arah.filter((p) => p && String(p).trim()));
    } else if (d.petunjuk_arah) {
      petunjuk = typeof d.petunjuk_arah === 'string' ? d.petunjuk_arah : JSON.stringify(d.petunjuk_arah);
    }

    const result = await execute(
      `UPDATE features SET
        layer_id=?, kategori=?, nama=?, deskripsi=?, deskripsi_lengkap=?, alamat=?, jam_layanan=?,
        petunjuk_arah=?, lat=?, lng=?, geometry=?, foto_1=?, foto_2=?, foto_3=?, is_active=?,
        updated_at=NOW()
       WHERE id=?`,
      [
        layerId,
        d.kategori ? String(d.kategori).trim() : null,
        String(d.nama).trim(),
        d.deskripsi ? String(d.deskripsi).trim() : null,
        d.deskripsi_lengkap ? String(d.deskripsi_lengkap).trim() : null,
        d.alamat ? String(d.alamat).trim() : null,
        d.jam_layanan ? String(d.jam_layanan).trim() : null,
        petunjuk,
        lat,
        lng,
        geometry,
        d.foto_1 || null,
        d.foto_2 || null,
        d.foto_3 || null,
        d.is_active != null ? (d.is_active ? 1 : 0) : 1,
        id,
      ]
    );
    await logActivity(req.user?.username || 'Admin', 'Edit Fitur', `Memperbarui fitur "${String(d.nama).trim()}" (ID ${id})`);
    res.json({ success: result.affectedRows > 0 });
  } catch (err) {
    console.error('updateFeature error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server: ' + (err.message || '') });
  }
}

export async function deleteFeature(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const feat = await getOne('SELECT nama FROM features WHERE id = ?', [id]);
    const result = await execute('DELETE FROM features WHERE id = ?', [id]);
    await logActivity(req.user?.username || 'Admin', 'Hapus Fitur', `Menghapus fitur "${feat?.nama || id}"`);
    res.json({ success: result.affectedRows > 0 });
  } catch (err) {
    console.error('deleteFeature error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
}

function detectGeometryType(features) {
  const counts = { polygon: 0, line: 0, point: 0 };
  for (const f of features || []) {
    const t = f?.geometry?.type;
    if (t === 'Polygon' || t === 'MultiPolygon') counts.polygon++;
    else if (t === 'LineString' || t === 'MultiLineString') counts.line++;
    else if (t === 'Point' || t === 'MultiPoint') counts.point++;
  }
  if (counts.polygon >= counts.line && counts.polygon >= counts.point && counts.polygon > 0) return 'polygon';
  if (counts.line > 0 && counts.line >= counts.point) return 'line';
  if (counts.point > 0) return 'point';
  return null;
}

export async function importFeatures(req, res) {
  try {
    if (!req.file) {
      return res.status(422).json({ success: false, message: 'File GeoJSON wajib diisi' });
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

    // Tentukan layer tujuan: by id ATAU by nama (find-or-create)
    let layer = null;
    if (req.body.layer_id) {
      layer = await getOne('SELECT * FROM layers WHERE id = ?', [parseInt(req.body.layer_id, 10)]);
    } else if (req.body.layer_nama) {
      const nama = String(req.body.layer_nama).trim();
      if (!nama) {
        return res.status(422).json({ success: false, message: 'Nama layer tujuan wajib diisi' });
      }
      layer = await getOne('SELECT * FROM layers WHERE LOWER(nama_layer) = ?', [nama.toLowerCase()]);
      if (!layer) {
        const tipe = detectGeometryType(geojson.features) || 'polygon';
        const [nextRow] = await query(
          'SELECT COALESCE(MAX(urutan), 0) + 1 AS next FROM layers'
        );
        const id = await insert(
          "INSERT INTO layers (nama_layer, tipe, warna, grup, urutan, is_active, manajemen) VALUES (?, ?, ?, ?, ?, 0, 'import')",
          [nama, tipe, '#292524', 'Lainnya', nextRow?.next || 1]
        );
        layer = await getOne('SELECT * FROM layers WHERE id = ?', [id]);
      }
    } else {
      return res.status(422).json({ success: false, message: 'Nama layer tujuan wajib diisi' });
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
          layer.id,
          props.Name || props.name || 'Tanpa Nama',
          props.description || null,
          lat,
          lng,
          geom ? JSON.stringify(geom) : null,
        ]
      );
      count++;
    }
    await logActivity(req.user?.username || 'Admin', 'Import GeoJSON', `Mengimpor ${count} fitur ke layer "${layer.nama_layer}"`);
    res.json({ success: true, data: { imported: count, layer: { id: layer.id, nama_layer: layer.nama_layer, created: !req.body.layer_id } } });
  } catch (err) {
    console.error('importFeatures error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
}
