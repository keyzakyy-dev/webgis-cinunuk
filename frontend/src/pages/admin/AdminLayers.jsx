import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api';
import './admin.css';

export default function AdminLayers() {
  const [layers, setLayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/layers?all=1');
      setLayers(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDelete(layer) {
    if (!confirm(`Hapus layer "${layer.nama_layer}" beserta semua fiturnya?`)) return;
    try {
      await api.del(`/api/layers/${layer.id}`);
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  const tipeLabel = { polygon: 'Polygon', line: 'Line', point: 'Point' };

  return (
    <>
      <div className="admin__toolbar">
        <h2>Layer</h2>
        <Link to="/admin/layers/new" className="admin__btn">+ Tambah Layer</Link>
      </div>

      {error && <div className="admin__msg admin__msg--err">{error}</div>}

      {loading ? (
        <p>Memuat…</p>
      ) : layers.length === 0 ? (
        <div className="admin__empty">Belum ada layer.</div>
      ) : (
        <div className="admin__card">
          <div className="admin__toolbar">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.12rem', fontWeight: 700 }}>Daftar Layer</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--admin-muted)' }}>{layers.length} total</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--admin-muted)' }}>{layers.filter(l => l.is_active).length} aktif</span>
              </div>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin__table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Urutan</th>
                  <th style={{ width: '60px' }}>Swatch</th>
                  <th>Nama Layer</th>
                  <th>Tipe</th>
                  <th>Grup</th>
                  <th>Fitur</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {layers.map((l) => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-mid)' }}>{l.urutan}</td>
                    <td><span className="admin__dot" style={{ background: l.warna }} /></td>
                    <td style={{ fontWeight: 500 }}>{l.nama_layer}</td>
                    <td>
                      <span style={{ 
                        padding: '0.15rem 0.55rem', 
                        borderRadius: '999px', 
                        fontSize: '0.72rem', 
                        fontWeight: 700, 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.04em',
                        background: l.tipe === 'polygon' ? '#f3f4f6' : l.tipe === 'line' ? '#fef3c7' : '#dbeafe',
                        color: l.tipe === 'polygon' ? '#374151' : l.tipe === 'line' ? '#b45309' : '#0369a1'
                      }}>
                        {tipeLabel[l.tipe] || l.tipe}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-mid)' }}>{l.grup}</td>
                    <td style={{ textAlign: 'center', fontWeight: 500 }}>{l.features_count ?? 0}</td>
                    <td>
                      <span className={`admin__badge ${l.is_active ? 'admin__badge--on' : 'admin__badge--off'}`}>
                        {l.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td>
                      <div className="admin__table-actions">
                        <button
                          className="admin__btn admin__btn--sm admin__btn--ghost"
                          onClick={() => navigate(`/admin/layers/${l.id}`)}
                        >
                          Edit
                        </button>
                        <button
                          className="admin__btn admin__btn--sm admin__btn--danger"
                          onClick={() => handleDelete(l)}
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
