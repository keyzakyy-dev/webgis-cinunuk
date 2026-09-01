import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import './admin.css';

export default function AdminImport() {
  const [layers, setLayers] = useState([]);
  const [layerId, setLayerId] = useState('');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    api.get('/api/layers?all=1')
      .then((r) => setLayers(r.data || []))
      .catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file || !layerId) {
      setError('Pilih layer dan file GeoJSON');
      return;
    }
    setBusy(true);
    setError('');
    setResult(null);
    try {
      const fd = new FormData();
      fd.append('layer_id', layerId);
      fd.append('geojson', file);
      const res = await api.upload('/api/features/import', fd);
      setResult(res.data.imported);
    } catch (err) {
      setError(err.message || 'Import gagal');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Link to="/admin" className="admin__back">← Dashboard</Link>
      <h2>Import GeoJSON</h2>
      {error && <div className="admin__msg admin__msg--err">{error}</div>}
      {result !== null && (
        <div className="admin__msg admin__msg--ok">Berhasil import {result} fitur ke database.</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="admin__card">
          <div className="admin__field">
            <label>Layer Tujuan *</label>
            <select className="admin__select" value={layerId} onChange={(e) => setLayerId(e.target.value)} required>
              <option value="">Pilih Layer</option>
              {layers.map((l) => (
                <option key={l.id} value={l.id}>{l.nama_layer} ({l.tipe})</option>
              ))}
            </select>
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
          <button type="button" onClick={() => { setFile(null); setLayerId(''); setResult(null); setError(''); }} className="admin__btn admin__btn--ghost" style={{ marginRight: 'auto' }}>Reset</button>
          <button className="admin__btn admin__btn--primary" disabled={busy}>
            {busy ? 'Importing…' : 'Import Sekarang'}
          </button>
        </div>
      </form>
    </>
  );
}