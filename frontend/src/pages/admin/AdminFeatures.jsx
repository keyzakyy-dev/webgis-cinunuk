import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api';
import './admin.css';

export default function AdminFeatures() {
  const [features, setFeatures] = useState([]);
  const [layers, setLayers] = useState([]);
  const [filterLayer, setFilterLayer] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/layers?all=1').then((r) => setLayers(r.data || []));
    load();
  }, []);

  async function load(layerId) {
    setLoading(true);
    setError('');
    try {
      // Admin perlu melihat semua fitur termasuk yang nonaktif
      const url = layerId
        ? `/api/features?layer_id=${layerId}&include_inactive=1`
        : '/api/features?include_inactive=1';
      const res = await api.get(url);
      setFeatures(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(filterLayer || undefined);
  }, [filterLayer]);

  async function handleDelete(f) {
    if (!confirm(`Hapus fitur "${f.nama}"?`)) return;
    try {
      await api.del(`/api/features/${f.id}`);
      load(filterLayer || undefined);
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <>
      <div className="admin__toolbar">
        <h2>Fitur / POI</h2>
        <Link to="/admin/features/new" className="admin__btn">+ Tambah Fitur</Link>
      </div>

      {error && <div className="admin__msg admin__msg--err">{error}</div>}

      <div className="admin__toolbar" style={{ marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.12rem', fontWeight: 700 }}>Daftar Fitur / POI</h3>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap' }}>Filter Layer:</label>
          <select
            className="admin__select"
            value={filterLayer}
            onChange={(e) => setFilterLayer(e.target.value)}
            style={{ maxWidth: '250px', width: '100%' }}
          >
            <option value="">Semua Layer</option>
            {layers.map((l) => (
              <option key={l.id} value={l.id}>{l.nama_layer}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="admin__card" style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--admin-muted)' }}>Memuat data…</p>
        </div>
      ) : features.length === 0 ? (
        <div className="admin__empty">
          <p style={{ marginBottom: '0.5rem', fontSize: '0.95rem' }}>Belum ada fitur.</p>
          <p style={{ fontSize: '0.82rem', color: 'var(--admin-muted)' }}>Klik "Tambah Fitur" untuk menambahkan data fitur pertama.</p>
        </div>
      ) : (
        <div className="admin__card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto', minWidth: '800px' }}>
            <table className="admin__table">
              <thead>
                <tr>
                  <th style={{ width: '60px', textAlign: 'center' }}>ID</th>
                  <th>Nama Fitur</th>
                  <th>Layer</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>Lat</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>Lng</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>Status</th>
                  <th style={{ width: '120px', textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {features.map((f) => (
                  <tr key={f.id} style={{ transition: 'background 0.15s ease' }}>
                    <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--admin-muted)' }}>{f.id}</td>
                    <td>
                      <div style={{ fontWeight: 500, marginBottom: '0.15rem' }}>{f.nama}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--admin-muted)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={f.deskripsi || ''}>
                        {f.deskripsi || '—'}
                      </div>
                    </td>
                    <td>
                      <span style={{ 
                        padding: '0.15rem 0.55rem', 
                        borderRadius: '999px', 
                        fontSize: '0.72rem', 
                        fontWeight: 600,
                        background: f.is_active ? '#f0fdf4' : '#f5f5f4',
                        color: f.is_active ? '#15803d' : '#78716c',
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em'
                      }}>
                        {f.layer_name}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', fontFamily: 'var(--serif)', fontSize: '0.85rem' }}>{f.lat ? parseFloat(f.lat).toFixed(5) : '—'}</td>
                    <td style={{ textAlign: 'center', fontFamily: 'var(--serif)', fontSize: '0.85rem' }}>{f.lng ? parseFloat(f.lng).toFixed(5) : '—'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`admin__badge ${f.is_active ? 'admin__badge--on' : 'admin__badge--off'}`} style={{ margin: '0 auto' }}>
                        {f.is_active ? 'Aktif' : 'Off'}
                      </span>
                    </td>
                    <td>
                      <div className="admin__table-actions" style={{ justifyContent: 'center' }}>
                        <button
                          className="admin__btn admin__btn--sm admin__btn--ghost"
                          onClick={() => navigate(`/admin/features/${f.id}`)}
                          title="Edit"
                        >
                          Edit
                        </button>
                        <button
                          className="admin__btn admin__btn--sm admin__btn--danger"
                          onClick={() => handleDelete(f)}
                          title="Hapus"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
