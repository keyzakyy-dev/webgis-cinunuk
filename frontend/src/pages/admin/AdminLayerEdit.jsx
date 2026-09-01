import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api';
import { useToast } from '../../context/ToastContext.jsx';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import './admin.css';

const EMPTY = {
  nama_layer: '',
  tipe: 'point',
  warna: '#18181b',
  grup: '',
  urutan: 0,
  is_active: 1,
};

export default function AdminLayerEdit() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [initialForm, setInitialForm] = useState(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Unsaved changes flag
  const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (!isEdit) return;
    async function load() {
      try {
        const res = await api.get(`/api/layers/${id}`);
        const { id: _i, geojson: _g, features_count: _fc, created_at: _ca, ...rest } = res.data;
        const loaded = {
          nama_layer: rest.nama_layer || '',
          tipe: rest.tipe || 'point',
          warna: rest.warna || '#18181b',
          grup: rest.grup || '',
          urutan: rest.urutan || 0,
          is_active: rest.is_active ?? 1,
        };
        setForm(loaded);
        setInitialForm(loaded);
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
      if (isEdit) {
        await api.put(`/api/layers/${id}`, form);
        toast.showToast(`Layer "${form.nama_layer}" berhasil disimpan.`, { type: 'success' });
      } else {
        await api.post('/api/layers', form);
        toast.showToast(`Layer "${form.nama_layer}" berhasil dibuat.`, { type: 'success' });
      }
      setInitialForm(form);
      navigate('/admin/layers');
    } catch (err) {
      setError(err.message || 'Gagal menyimpan');
    } finally {
      setBusy(false);
    }
  }

  function handleCancel() {
    if (isDirty && !confirm('Perubahan belum disimpan. Yakin ingin keluar?')) return;
    navigate('/admin/layers');
  }

  if (loading) {
    return (
      <div className="admin__card">
        <div className="admin__skeleton-wrap">
          {[...Array(4)].map((_, i) => <div key={i} className="admin__skeleton" style={{ height: '44px', borderRadius: '6px' }} />)}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '720px' }}>
      <Breadcrumbs
        items={[
          { label: 'Layer Peta', to: '/admin/layers' },
          { label: isEdit ? `Edit: ${form.nama_layer || id}` : 'Tambah Layer' },
        ]}
      />

      <div className="admin__pagehead" style={{ marginBottom: '1.25rem' }}>
        <div>
          <p className="admin__eyebrow">{isEdit ? 'Ubah Konfigurasi' : 'Layer Baru'}</p>
          <h2 style={{ margin: 0 }}>{isEdit ? `Edit: ${form.nama_layer || 'Layer'}` : 'Tambah Layer Peta'}</h2>
        </div>
        {isDirty && (
          <span className="admin__chip admin__chip--warn">Belum disimpan</span>
        )}
      </div>

      {error && <div className="admin__msg admin__msg--err">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="admin__card">
          <p className="admin__eyebrow">Informasi Layer</p>
          <div className="admin__field">
            <label>Nama Layer *</label>
            <input
              className="admin__input"
              value={form.nama_layer}
              onChange={(e) => update('nama_layer', e.target.value)}
              required
              placeholder="Contoh: Batas RW, Jaringan Jalan, Sekolah…"
            />
          </div>

          <div className="admin__form-grid">
            <div className="admin__field">
              <label>Tipe Geometry</label>
              <select className="admin__select" value={form.tipe} onChange={(e) => update('tipe', e.target.value)}>
                <option value="polygon">Polygon (Area / Wilayah)</option>
                <option value="line">Line (Garis / Rute / Jalan)</option>
                <option value="point">Point (Titik Lokasi / POI)</option>
              </select>
            </div>
            <div className="admin__field">
              <label>Grup Layer</label>
              <input
                className="admin__input"
                value={form.grup}
                onChange={(e) => update('grup', e.target.value)}
                placeholder="Mis. Batas Wilayah, Fasilitas, Infrastruktur"
              />
            </div>
          </div>
        </div>

        <div className="admin__card">
          <p className="admin__eyebrow">Tampilan & Posisi</p>
          <div className="admin__form-grid">
            <div className="admin__field">
              <label>Warna Aksen</label>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <input
                  className="admin__input"
                  type="color"
                  value={form.warna}
                  onChange={(e) => update('warna', e.target.value)}
                  style={{ width: '48px', height: '36px', padding: '2px', cursor: 'pointer' }}
                />
                <span className="admin__chip admin__chip--soft" style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                  <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: form.warna, marginRight: '6px' }} />
                  {form.warna.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="admin__field">
              <label>Urutan Tampil (Z-Index)</label>
              <input
                className="admin__input"
                type="number"
                min="0"
                value={form.urutan}
                onChange={(e) => update('urutan', Number(e.target.value))}
              />
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--admin-border-subtle)', paddingTop: '1rem', marginTop: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={Boolean(form.is_active)}
                onChange={(e) => update('is_active', e.target.checked ? 1 : 0)}
                style={{ width: '16px', height: '16px' }}
              />
              <div>
                <strong style={{ display: 'block', fontSize: '0.875rem' }}>Aktifkan di Peta Publik</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--admin-muted)' }}>Layer dan fiturnya dapat dilihat oleh masyarakat umum</span>
              </div>
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button type="button" onClick={handleCancel} className="admin__btn admin__btn--ghost" disabled={busy}>Batal</button>
          <button className="admin__btn admin__btn--primary" disabled={busy}>
            {busy ? 'Menyimpan…' : isEdit ? 'Simpan Perubahan' : 'Buat Layer'}
          </button>
        </div>
      </form>
    </div>
  );
}
