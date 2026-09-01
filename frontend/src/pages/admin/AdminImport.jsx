import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import './admin.css';

export default function AdminImport() {
  const [layerName, setLayerName] = useState('');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file || !layerName.trim()) {
      setError('Isi nama layer tujuan dan pilih file GeoJSON');
      return;
    }
    setBusy(true);
    setError('');
    setResult(null);
    try {
      const fd = new FormData();
      fd.append('layer_nama', layerName.trim());
      fd.append('geojson', file);
      const res = await api.upload('/api/features/import', fd);
      setResult(res.data);
    } catch (err) {
      setError(err.message || 'Import gagal');
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setLayerName('');
    setFile(null);
    setResult(null);
    setError('');
  }

  return (
    <>
      <Link to="/admin" className="admin__back">← Dashboard</Link>
      <h2>Import GeoJSON</h2>
      {error && <div className="admin__msg admin__msg--err">{error}</div>}
      {result && (
        <div className="admin__msg admin__msg--ok">
          {result.layer?.created ? (
            <>Layer baru <strong>{result.layer.nama_layer}</strong> dibuat &mdash; {result.imported} fitur diimport.</>
          ) : (
            <>{result.imported} fitur diimport ke layer <strong>{result.layer?.nama_layer}</strong>.</>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="admin__card">
          <div className="admin__field">
            <label>Layer Tujuan *</label>
            <input
              className="admin__input"
              type="text"
              value={layerName}
              onChange={(e) => setLayerName(e.target.value)}
              required
              placeholder="Tulis nama layer, mis. Pemukiman, Pendidikan, Jalan Baru…"
            />
            <span style={{ fontSize: '0.8rem', color: 'var(--admin-muted)', marginTop: '0.3rem', display: 'block' }}>
              Jika layer belum ada, akan dibuat otomatis.
            </span>
          </div>

          <div className="admin__field">
            <label>File GeoJSON (FeatureCollection)</label>
            <label className="admin__drop">
              {file ? file.name : 'Klik untuk pilih .geojson atau .json'}
              <input
                type="file"
                accept=".geojson,.json"
                style={{ display: 'none' }}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>
          </div>

          {file && (
            <p style={{ fontSize: '0.82rem', color: 'var(--admin-muted)' }}>
              {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button type="button" onClick={reset} className="admin__btn admin__btn--ghost" style={{ marginRight: 'auto' }}>Reset</button>
          <button className="admin__btn admin__btn--primary" disabled={busy}>
            {busy ? 'Importing…' : 'Import Sekarang'}
          </button>
        </div>
      </form>
    </>
  );
}