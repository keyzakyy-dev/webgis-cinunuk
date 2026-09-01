import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useToast } from '../../context/ToastContext.jsx';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import './admin.css';

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
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [initialForm, setInitialForm] = useState(EMPTY);
  const [layers, setLayers] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Local instant image preview state
  const [uploadingField, setUploadingField] = useState(null);

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
    api.get('/api/layers?all=1')
      .then((r) => {
        const all = r.data || [];
        const filtered = all.filter((l) => l.tipe === 'point' || l.manajemen === 'poi');
        setLayers(filtered.length > 0 ? filtered : all);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const res = await api.get(`/api/features/${id}`);
        const f = res.data;
        const loaded = {
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
        };
        setForm(loaded);
        setInitialForm(loaded);
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

  async function handlePhotoUpload(field, e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant local preview
    const reader = new FileReader();
    reader.onload = () => update(field, reader.result);
    reader.readAsDataURL(file);

    setUploadingField(field);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('subfolder', 'poi');
    try {
      const res = await api.upload('/api/upload', fd);
      update(field, res.data.url);
      toast.showToast('Foto berhasil diunggah ke server.', { type: 'success' });
    } catch (err) {
      toast.showToast('Gagal upload: ' + err.message, { type: 'error' });
    } finally {
      setUploadingField(null);
    }
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
    if (!form.layer_id) {
      setError('Pilih layer tujuan');
      return;
    }
    if (!form.nama || !form.nama.trim()) {
      setError('Nama fitur/lokasi wajib diisi');
      return;
    }

    setBusy(true);
    setError('');
    try {
      const latVal = form.lat !== '' && form.lat != null && !isNaN(Number(form.lat)) ? Number(form.lat) : null;
      const lngVal = form.lng !== '' && form.lng != null && !isNaN(Number(form.lng)) ? Number(form.lng) : null;

      const body = {
        ...form,
        layer_id: Number(form.layer_id),
        lat: latVal,
        lng: lngVal,
        is_active: form.is_active ? 1 : 0,
      };
      if (isEdit) {
        await api.put(`/api/features/${id}`, body);
        toast?.showToast?.(`Fitur "${form.nama}" berhasil diperbarui`, { type: 'success' });
      } else {
        await api.post('/api/features', body);
        toast?.showToast?.(`Fitur "${form.nama}" berhasil ditambahkan`, { type: 'success' });
      }
      setInitialForm(form);
      navigate('/admin/features');
    } catch (err) {
      const msg = err.message || 'Gagal menyimpan data fitur';
      setError(msg);
      toast?.showToast?.(msg, { type: 'error' });
    } finally {
      setBusy(false);
    }
  }

  function handleCancel() {
    if (isDirty && !confirm('Perubahan belum disimpan. Yakin ingin keluar?')) return;
    navigate('/admin/features');
  }

  if (loading) {
    return (
      <div className="admin__card">
        <div className="admin__skeleton-wrap">
          {[...Array(6)].map((_, i) => <div key={i} className="admin__skeleton" style={{ height: '44px', borderRadius: '6px' }} />)}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '780px' }}>
      <Breadcrumbs
        items={[
          { label: 'Fitur & POI', to: '/admin/features' },
          { label: isEdit ? `Edit: ${form.nama || id}` : 'Tambah Fitur' },
        ]}
      />

      <div className="admin__pagehead" style={{ marginBottom: '1.25rem' }}>
        <div>
          <p className="admin__eyebrow">{isEdit ? 'Ubah Data' : 'Fitur Baru'}</p>
          <h2 style={{ margin: 0 }}>{isEdit ? `Edit: ${form.nama || 'Fitur'}` : 'Tambah Fitur / Titik Lokasi'}</h2>
        </div>
        {isDirty && (
          <span className="admin__chip admin__chip--warn">Belum disimpan</span>
        )}
      </div>

      {error && <div className="admin__msg admin__msg--err">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="admin__card">
          <p className="admin__eyebrow">Identitas Objek</p>
          <div className="admin__form-grid">
            <div className="admin__field">
              <label>Layer Tujuan *</label>
              <select className="admin__select" value={form.layer_id} onChange={(e) => update('layer_id', e.target.value)} required>
                <option value="">Pilih Layer</option>
                {layers.map((l) => (
                  <option key={l.id} value={l.id}>{l.nama_layer} ({l.tipe})</option>
                ))}
              </select>
            </div>
            <div className="admin__field">
              <label>Kategori Lokasi</label>
              <select className="admin__select" value={form.kategori} onChange={(e) => update('kategori', e.target.value)}>
                {KATEGORI_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="admin__field">
            <label>Nama Fitur / Lokasi *</label>
            <input className="admin__input" value={form.nama} onChange={(e) => update('nama', e.target.value)} required placeholder="Contoh: Kantor Desa Cinunuk, SDN 1 Cinunuk…" />
          </div>

          <div className="admin__field">
            <label>Deskripsi Singkat</label>
            <input className="admin__input" value={form.deskripsi} onChange={(e) => update('deskripsi', e.target.value)} placeholder="Tampil pada pop-up peta" />
          </div>

          <div className="admin__field">
            <label>Deskripsi Lengkap</label>
            <textarea className="admin__textarea" value={form.deskripsi_lengkap} onChange={(e) => update('deskripsi_lengkap', e.target.value)} placeholder="Tampil pada halaman detail lokasi publik" />
          </div>
        </div>

        <div className="admin__card">
          <p className="admin__eyebrow">Informasi Spasial & Operasional</p>
          <div className="admin__form-grid">
            <div className="admin__field">
              <label>Latitude (Garis Lintang)</label>
              <input className="admin__input" type="number" step="any" value={form.lat} onChange={(e) => update('lat', e.target.value)} placeholder="-6.938…" />
            </div>
            <div className="admin__field">
              <label>Longitude (Garis Bujur)</label>
              <input className="admin__input" type="number" step="any" value={form.lng} onChange={(e) => update('lng', e.target.value)} placeholder="107.729…" />
            </div>
          </div>

          <div className="admin__form-grid">
            <div className="admin__field">
              <label>Alamat Lengkap</label>
              <input className="admin__input" value={form.alamat} onChange={(e) => update('alamat', e.target.value)} placeholder="Jl. Raya Cinunuk No. ..." />
            </div>
            <div className="admin__field">
              <label>Jam Layanan</label>
              <input className="admin__input" value={form.jam_layanan} onChange={(e) => update('jam_layanan', e.target.value)} placeholder="Senin - Jumat, 08.00 - 15.00" />
            </div>
          </div>

          <div className="admin__field">
            <label>Petunjuk Arah</label>
            {form.petunjuk_arah.map((p, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  className="admin__input"
                  value={p}
                  onChange={(e) => updatePetunjukArah(i, e.target.value)}
                  placeholder={`Langkah ke-${i + 1}`}
                />
                <button type="button" className="admin__btn admin__btn--sm admin__btn--danger" onClick={() => removePetunjukArah(i)}>✕</button>
              </div>
            ))}
            <button type="button" className="admin__btn admin__btn--sm admin__btn--ghost" onClick={addPetunjukArah}>
              + Tambah Langkah Rute
            </button>
          </div>
        </div>

        <div className="admin__card">
          <p className="admin__eyebrow">Foto & Status</p>
          <div className="admin__field">
            <label>Foto Dokumentasi (Maksimal 3 Foto)</label>
            <div className="admin__photo-row">
              {['foto_1', 'foto_2', 'foto_3'].map((field, i) => (
                <div key={field} style={{ position: 'relative' }}>
                  <label className="admin__photo" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {uploadingField === field ? (
                      <span className="admin__spinner" />
                    ) : form[field] ? (
                      <img src={form[field]} alt={`Foto ${i + 1}`} />
                    ) : (
                      <div style={{ textAlign: 'center', color: 'var(--admin-muted)', fontSize: '0.75rem' }}>
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 2px' }}>
                          <rect width="18" height="18" x="3" y="3" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                        </svg>
                        Upload
                      </div>
                    )}
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handlePhotoUpload(field, e)} />
                  </label>
                  {form[field] && (
                    <button type="button" className="admin__photo-remove" onClick={() => update(field, '')} title="Hapus foto">✕</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--admin-border-subtle)', paddingTop: '1rem', marginTop: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={Boolean(form.is_active)}
                onChange={(e) => update('is_active', e.target.checked ? 1 : 0)}
                style={{ width: '16px', height: '16px' }}
              />
              <div>
                <strong style={{ display: 'block', fontSize: '0.875rem' }}>Tampilkan di Peta Web</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--admin-muted)' }}>Fitur / POI ini akan dimuat secara publik</span>
              </div>
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button type="button" onClick={handleCancel} className="admin__btn admin__btn--ghost" disabled={busy}>Batal</button>
          <button className="admin__btn admin__btn--primary" disabled={busy}>
            {busy ? 'Menyimpan…' : isEdit ? 'Simpan Perubahan' : 'Simpan Fitur'}
          </button>
        </div>
      </form>
    </div>
  );
}
