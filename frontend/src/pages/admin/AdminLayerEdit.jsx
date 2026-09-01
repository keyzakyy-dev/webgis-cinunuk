import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api';
import './admin.css';

const EMPTY = {
  nama_layer: '',
  tipe: 'point',
  warna: '#292524',
  grup: '',
  urutan: 0,
  is_active: 1,
};

export default function AdminLayerEdit() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    async function load() {
      try {
        const res = await api.get(`/api/layers/${id}`);
        const { id: _i, geojson: _g, features_count: _fc, created_at: _ca, ...rest } = res.data;
        setForm({
          nama_layer: rest.nama_layer || '',
          tipe: rest.tipe || 'point',
          warna: rest.warna || '#292524',
          grup: rest.grup || '',
          urutan: rest.urutan || 0,
          is_active: rest.is_active ?? 1,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, isEdit]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (isEdit) await api.put(`/api/layers/${id}`, form);
      else await api.post('/api/layers', form);
      navigate('/admin/layers');
    } catch (err) {
      setError(err.message || 'Gagal menyimpan');
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p>Memuat…</p>;

  return (
    <>
      <Link to="/admin/layers" className="admin__back">← Kembali ke Daftar Layer</Link>
      <h2>{isEdit ? 'Edit Layer' : 'Tambah Layer'}</h2>
      {error && <div className="admin__msg admin__msg--err">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="admin__card">
          <div className="admin__form-grid">
            <div className="admin__field">
              <label>Nama Layer *</label>
              <input className="admin__input" value={form.nama_layer} onChange={(e) => update('nama_layer', e.target.value)} required placeholder="Mis. Batas Desa" />
            </div>

            <div className="admin__field">
              <label>Tipe Geometry</label>
              <select className="admin__select" value={form.tipe} onChange={(e) => update('tipe', e.target.value)}>
                <option value="polygon">Polygon</option>
                <option value="line">Line</option>
                <option value="point">Point</option>
              </select>
            </div>

            <div className="admin__field">
              <label>Warna</label>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <input className="admin__input" type="color" value={form.warna} onChange={(e) => update('warna', e.target.value)} style={{ width: '60px', height: '36px', padding: '2px', borderRadius: '6px', border: '1px solid var(--admin-border)' }} />
                <span style={{ fontSize: '0.82rem', color: form.warna, fontWeight: 600 }}>{form.warna.toUpperCase()}</span>
              </div>
            </div>

            <div className="admin__field">
              <label>Grup</label>
              <input className="admin__input" value={form.grup} onChange={(e) => update('grup', e.target.value)} placeholder="Mis. Infrastruktur" />
            </div>

            <div className="admin__field">
              <label>Urutan</label>
              <input className="admin__input admin__input--sm" type="number" min="0" value={form.urutan} onChange={(e) => update('urutan', Number(e.target.value))} />
            </div>
          </div>

          <label className="admin__field" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <input type="checkbox" checked={Boolean(form.is_active)} onChange={(e) => update('is_active', e.target.checked ? 1 : 0)} />
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Aktif di publik</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--admin-muted)' }}>(ditampilkan di peta web publik)</span>
          </label>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button type="button" onClick={() => navigate('/admin/layers')} className="admin__btn admin__btn--ghost" style={{ marginRight: 'auto' }}>Batal</button>
          <button className="admin__btn admin__btn--primary" disabled={busy}>
            {busy ? 'Menyimpan…' : 'Simpan Layer'}
          </button>
        </div>
      </form>
    </>
  );
}