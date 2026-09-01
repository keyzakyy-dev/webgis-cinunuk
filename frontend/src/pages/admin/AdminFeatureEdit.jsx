import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api';

const KATEGORI_OPTIONS = [
  { value: '', label: '— Pilih kategori —' },
  { value: 'Fasilitas Sekolah', label: 'Fasilitas Sekolah' },
  { value: 'Fasilitas Pendidikan', label: 'Fasilitas Pendidikan' },
  { value: 'Tempat Ibadah', label: 'Tempat Ibadah' },
  { value: 'Fasilitas Kesehatan', label: 'Fasilitas Kesehatan' },
  { value: 'Kantor Pemerintahan', label: 'Kantor Pemerintahan' },
  { value: 'Fasilitas Umum', label: 'Fasilitas Umum' },
  { value: 'Lainnya', label: 'Lainnya' },
];

const EMPTY = {
  layer_id: '',
  kategori: '',
  nama: '',
  deskripsi: '',
  deskripsi_lengkap: '',
  alamat: '',
  jam_layanan: '',
  petunjuk_arah: [],
  lat: '',
  lng: '',
  geometry: null,
  foto_1: '',
  foto_2: '',
  foto_3: '',
  is_active: 1,
};

export default function AdminFeatureEdit() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [layers, setLayers] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/layers?all=1')
      .then((r) => setLayers((r.data || []).filter((l) => l.tipe === 'point' || l.manajemen === 'poi')))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const res = await api.get(`/api/features/${id}`);
        const f = res.data;
        setForm({
          layer_id: f.layer_id,
          kategori: f.kategori || '',
          nama: f.nama,
          deskripsi: f.deskripsi || '',
          deskripsi_lengkap: f.deskripsi_lengkap || '',
          alamat: f.alamat || '',
          jam_layanan: f.jam_layanan || '',
          petunjuk_arah: (() => {
            try { return f.petunjuk_arah ? JSON.parse(f.petunjuk_arah) : []; }
            catch { return []; }
          })(),
          lat: f.lat || '',
          lng: f.lng || '',
          geometry: f.geometry ? (() => { try { return typeof f.geometry === 'string' ? JSON.parse(f.geometry) : f.geometry; } catch { return null; } })() : null,
          foto_1: f.foto_1 || '',
          foto_2: f.foto_2 || '',
          foto_3: f.foto_3 || '',
          is_active: f.is_active ?? 1,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('subfolder', 'poi');
    try {
      const res = await api.upload('/api/upload', fd);
      return res.data.url;
    } catch (err) {
      alert('Upload gagal: ' + err.message);
      return null;
    }
  }

  async function handlePhotoUpload(field, e) {
    const url = await handleUpload(e);
    if (url) update(field, url);
  }

  function addPetunjukArah() {
    update('petunjuk_arah', [...(form.petunjuk_arah || []), '']);
  }
  function removePetunjukArah(i) {
    update('petunjuk_arah', form.petunjuk_arah.filter((_, idx) => idx !== i));
  }
  function updatePetunjukArah(i, val) {
    const next = [...form.petunjuk_arah];
    next[i] = val;
    update('petunjuk_arah', next);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const body = {
        ...form,
        layer_id: Number(form.layer_id),
        lat: form.lat ? Number(form.lat) : null,
        lng: form.lng ? Number(form.lng) : null,
        is_active: form.is_active ? 1 : 0,
      };
      if (isEdit) await api.put(`/api/features/${id}`, body);
      else await api.post('/api/features', body);
      navigate('/admin/features');
    } catch (err) {
      setError(err.message || 'Gagal menyimpan');
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p>Memuat…</p>;

  return (
    <>
      <Link to="/admin/features" className="admin__back">← Kembali ke Daftar Fitur</Link>
      <h2>{isEdit ? 'Edit Fitur' : 'Tambah Fitur'}</h2>
      {error && <div className="admin__msg admin__msg--err">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="admin__card">
          <div className="admin__form-grid">
            <div className="admin__field">
              <label>Layer *</label>
              <select className="admin__select" value={form.layer_id} onChange={(e) => update('layer_id', e.target.value)} required>
                <option value="">Pilih Layer</option>
                {layers.map((l) => (
                  <option key={l.id} value={l.id}>{l.nama_layer} ({l.tipe})</option>
                ))}
              </select>
            </div>
            <div className="admin__field">
              <label>Kategori *</label>
              <select className="admin__select" value={form.kategori} onChange={(e) => update('kategori', e.target.value)} required>
                {KATEGORI_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="admin__field">
              <label>Nama *</label>
              <input className="admin__input" value={form.nama} onChange={(e) => update('nama', e.target.value)} required placeholder="Mis. Kantor Desa Cinunuk" />
            </div>
          </div>

          <div className="admin__field">
            <label>Deskripsi Singkat</label>
            <input className="admin__input" value={form.deskripsi} onChange={(e) => update('deskripsi', e.target.value)} placeholder="Deskripsi singkat lokasi ini" />
          </div>

          <div className="admin__field">
            <label>Deskripsi Lengkap</label>
            <textarea className="admin__textarea" value={form.deskripsi_lengkap} onChange={(e) => update('deskripsi_lengkap', e.target.value)} placeholder="Deskripsi lengkap, tampil di halaman detail" />
          </div>

          <div className="admin__form-grid">
            <div className="admin__field">
              <label>Alamat</label>
              <input className="admin__input" value={form.alamat} onChange={(e) => update('alamat', e.target.value)} placeholder="Jl. Contoh No. 1, Desa Cinunuk" />
            </div>
            <div className="admin__field">
              <label>Jam Layanan</label>
              <input className="admin__input" value={form.jam_layanan} onChange={(e) => update('jam_layanan', e.target.value)} placeholder="Senin–Jumat, 08.00–14.00" />
            </div>
          </div>

          <div className="admin__form-grid">
            <div className="admin__field">
              <label>Latitude</label>
              <input className="admin__input" type="number" step="any" value={form.lat} onChange={(e) => update('lat', e.target.value)} placeholder="-7.1736" />
            </div>
            <div className="admin__field">
              <label>Longitude</label>
              <input className="admin__input" type="number" step="any" value={form.lng} onChange={(e) => update('lng', e.target.value)} placeholder="107.9701" />
            </div>
          </div>

          <div className="admin__field">
            <label>Petunjuk Arah</label>
            {form.petunjuk_arah.map((p, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <input
                  className="admin__input"
                  value={p}
                  onChange={(e) => updatePetunjukArah(i, e.target.value)}
                  placeholder={`Langkah ${i + 1}`}
                />
                <button type="button" className="admin__btn admin__btn--sm admin__btn--danger" onClick={() => removePetunjukArah(i)}>✕</button>
              </div>
            ))}
            <button type="button" className="admin__btn admin__btn--sm admin__btn--ghost" onClick={addPetunjukArah}>+ Tambah Langkah</button>
          </div>

          <div className="admin__field">
            <label>Foto</label>
            <div className="admin__photo-row">
              {['foto_1', 'foto_2', 'foto_3'].map((field, i) => (
                <div key={field}>
                  <label className="admin__photo" style={{ cursor: 'pointer' }}>
                    {form[field] ? (
                      <img src={form[field]} alt={`Foto ${i + 1}`} />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '0.75rem', color: '#a8a29e' }}>Pilih</div>
                    )}
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handlePhotoUpload(field, e)} />
                  </label>
                  {form[field] && (
                    <button type="button" className="admin__photo-remove" onClick={() => update(field, '')}>✕</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <label className="admin__field" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <input type="checkbox" checked={Boolean(form.is_active)} onChange={(e) => update('is_active', e.target.checked ? 1 : 0)} />
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Aktif di publik</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--admin-muted)' }}>(ditampilkan di peta web publik)</span>
          </label>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button type="button" onClick={() => navigate('/admin/features')} className="admin__btn admin__btn--ghost" style={{ marginRight: 'auto' }}>Batal</button>
          <button className="admin__btn admin__btn--primary" disabled={busy}>
            {busy ? 'Menyimpan…' : 'Simpan Fitur'}
          </button>
        </div>
      </form>
    </>
  );
}