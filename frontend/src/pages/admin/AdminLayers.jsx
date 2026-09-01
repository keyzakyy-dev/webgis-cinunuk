import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useToast } from '../../context/ToastContext.jsx';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import ConfirmModal from '../../components/ConfirmModal.jsx';
import Pagination from '../../components/Pagination.jsx';
import { exportToCsv } from '../../utils/exportCsv.js';
import './admin.css';

const TIPE_STYLE = {
  polygon: { bg: '#f4f4f5', color: '#52525b' },
  line: { bg: '#fffbeb', color: '#92400e' },
  point: { bg: '#eff6ff', color: '#1d4ed8' },
};

const MAX_SIZE = 15 * 1024 * 1024;

function readGeoJSONText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsText(file);
  });
}

function summarize(content) {
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    return { ok: false, error: 'File bukan JSON valid.' };
  }
  if (!parsed || parsed.type !== 'FeatureCollection' || !Array.isArray(parsed.features)) {
    return { ok: false, error: 'File harus FeatureCollection (GeoJSON) dengan array "features".' };
  }
  const features = parsed.features;
  const counts = { polygon: 0, line: 0, point: 0, other: 0 };
  let unnamed = 0;
  const sample = [];
  for (const f of features) {
    const t = f?.geometry?.type;
    if (t === 'Polygon' || t === 'MultiPolygon') counts.polygon++;
    else if (t === 'LineString' || t === 'MultiLineString') counts.line++;
    else if (t === 'Point' || t === 'MultiPoint') counts.point++;
    else counts.other++;
    const name = f?.properties?.Name || f?.properties?.name || f?.properties?.nama || '';
    if (!name) unnamed++;
    if (sample.length < 5) sample.push(name || '(tanpa nama)');
  }
  return { ok: true, total: features.length, counts, unnamed, sample };
}

export default function AdminLayers() {
  const [layers, setLayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  
  // Sorting & Pagination state
  const [sortField, setSortField] = useState('urutan');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState([]);

  // Confirm Modal state
  const [modalState, setModalState] = useState({ isOpen: false, title: '', message: '', type: 'danger', action: null });
  const [modalBusy, setModalBusy] = useState(false);

  // Import Panel Collapsible State
  const [importOpen, setImportOpen] = useState(false);
  const [importLayerName, setImportLayerName] = useState('');
  const [importSelectedLayerId, setImportSelectedLayerId] = useState('');
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState(null);
  const [importBusy, setImportBusy] = useState(false);
  const [importError, setImportError] = useState('');
  const [importResult, setImportResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const navigate = useNavigate();
  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/layers?all=1');
      setLayers(res.data || []);
      setSelectedIds([]);
    } catch (err) {
      setError(err.message || 'Gagal memuat daftar layer');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Sort & Filter
  const filteredAndSorted = useMemo(() => {
    let result = layers.filter((l) =>
      l.nama_layer.toLowerCase().includes(search.toLowerCase()) ||
      (l.grup || '').toLowerCase().includes(search.toLowerCase())
    );

    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [layers, search, sortField, sortOrder]);

  // Paginated Data
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredAndSorted.slice(start, start + pageSize);
  }, [filteredAndSorted, page, pageSize]);

  function handleSort(field) {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  }

  function toggleSelectAll() {
    if (selectedIds.length === paginatedData.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedData.map((l) => l.id));
    }
  }

  function toggleSelectOne(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  // Import Handlers
  async function handleImportFile(selected) {
    setImportError('');
    setImportResult(null);
    setImportPreview(null);
    if (!selected) return;
    if (selected.size > MAX_SIZE) {
      setImportError(`File terlalu besar (${(selected.size / 1024 / 1024).toFixed(1)} MB). Maksimal 15 MB.`);
      return;
    }
    setImportFile(selected);
    try {
      const text = await readGeoJSONText(selected);
      const summary = summarize(text);
      if (!summary.ok) {
        setImportError(summary.error);
        setImportFile(null);
        return;
      }
      setImportPreview(summary);
    } catch (e) {
      setImportError(e.message);
      setImportFile(null);
    }
  }

  async function handleImportSubmit(e) {
    e.preventDefault();
    const targetName = importSelectedLayerId
      ? (layers.find(l => String(l.id) === String(importSelectedLayerId))?.nama_layer || '')
      : importLayerName.trim();

    if (!importFile || !targetName) {
      setImportError('Isi nama layer atau pilih layer tujuan dan sertakan file GeoJSON.');
      return;
    }
    setImportBusy(true);
    setImportError('');
    try {
      const fd = new FormData();
      if (importSelectedLayerId) {
        fd.append('layer_id', importSelectedLayerId);
      } else {
        fd.append('layer_nama', targetName);
      }
      fd.append('geojson', importFile);
      const res = await api.upload('/api/features/import', fd);
      setImportResult(res.data);
      toast.showToast(
        res.data.layer?.created
          ? `Layer "${res.data.layer.nama_layer}" dibuat & ${res.data.imported} fitur diimport.`
          : `${res.data.imported} fitur diimport ke "${res.data.layer?.nama_layer}".`,
        { type: 'success' }
      );
      load();
    } catch (err) {
      const msg = err.message || 'Import gagal. Periksa format file.';
      setImportError(msg);
      toast.showToast(msg, { type: 'error' });
    } finally {
      setImportBusy(false);
    }
  }

  function resetImport() {
    setImportLayerName('');
    setImportSelectedLayerId('');
    setImportFile(null);
    setImportPreview(null);
    setImportResult(null);
    setImportError('');
    if (fileRef.current) fileRef.current.value = '';
  }

  function openImportForLayer(layer) {
    setImportSelectedLayerId(layer.id);
    setImportLayerName(layer.nama_layer);
    setImportOpen(true);
  }

  // Delete Handlers
  function triggerDeleteOne(layer) {
    setModalState({
      isOpen: true,
      title: 'Hapus Layer Peta?',
      message: `Layer "${layer.nama_layer}" beserta seluruh fitur di dalamnya akan dihapus permanen.`,
      type: 'danger',
      action: async () => {
        setModalBusy(true);
        try {
          await api.del(`/api/layers/${layer.id}`);
          toast.showToast(`Layer "${layer.nama_layer}" dihapus.`, { type: 'success' });
          load();
        } catch (err) {
          toast.showToast(err.message || 'Gagal menghapus layer', { type: 'error' });
        } finally {
          setModalBusy(false);
          setModalState({ isOpen: false });
        }
      },
    });
  }

  function triggerBulkDelete() {
    setModalState({
      isOpen: true,
      title: `Hapus ${selectedIds.length} Layer Terpilih?`,
      message: `Tindakan ini akan menghapus ${selectedIds.length} layer yang dipilih beserta semua objek fiturnya.`,
      type: 'danger',
      action: async () => {
        setModalBusy(true);
        try {
          await Promise.all(selectedIds.map((id) => api.del(`/api/layers/${id}`)));
          toast.showToast(`${selectedIds.length} layer berhasil dihapus.`, { type: 'success' });
          load();
        } catch (err) {
          toast.showToast('Sebagian layer gagal dihapus', { type: 'error' });
        } finally {
          setModalBusy(false);
          setModalState({ isOpen: false });
        }
      },
    });
  }

  async function triggerBulkToggleStatus(setActive) {
    try {
      await Promise.all(
        selectedIds.map(async (id) => {
          const l = layers.find((item) => item.id === id);
          if (l) {
            await api.put(`/api/layers/${id}`, { ...l, is_active: setActive ? 1 : 0 });
          }
        })
      );
      toast.showToast(`${selectedIds.length} layer di-` + (setActive ? 'aktifkan.' : 'nonaktifkan.'), { type: 'success' });
      load();
    } catch (err) {
      toast.showToast('Gagal memperbarui status layer', { type: 'error' });
    }
  }

  function handleExportCsv() {
    exportToCsv(
      'daftar_layer_sig_cinunuk',
      filteredAndSorted,
      [
        { key: 'urutan', label: 'Urutan' },
        { key: 'nama_layer', label: 'Nama Layer' },
        { key: 'tipe', label: 'Tipe' },
        { key: 'grup', label: 'Grup' },
        { key: 'warna', label: 'Kode Warna' },
        { key: 'features_count', label: 'Jumlah Fitur' },
        { key: 'is_active', label: 'Aktif' },
      ]
    );
    toast.showToast('Data layer berhasil diexport ke CSV.', { type: 'success' });
  }

  const tipeLabel = { polygon: 'Polygon', line: 'Line', point: 'Point' };

  return (
    <>
      <Breadcrumbs items={[{ label: 'Layer Peta' }]} />

      <div className="admin__pagehead">
        <div>
          <p className="admin__eyebrow">Manajemen Peta</p>
          <h2 style={{ margin: 0 }}>Layer Peta</h2>
        </div>
        <div className="admin__pagehead-actions">
          <button
            className={`admin__btn ${importOpen ? 'admin__btn--ghost' : ''}`}
            onClick={() => setImportOpen((v) => !v)}
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
            {importOpen ? 'Tutup Panel Import' : 'Import GeoJSON'}
          </button>
          <button className="admin__btn admin__btn--ghost" onClick={handleExportCsv} disabled={layers.length === 0}>
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" />
            </svg>
            Export CSV
          </button>
          <Link to="/admin/layers/new" className="admin__btn admin__btn--primary">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" x2="12" y1="5" y2="19" /><line x1="5" x2="19" y1="12" y2="12" />
            </svg>
            Tambah Layer
          </Link>
        </div>
      </div>

      {error && (
        <div className="admin__msg admin__msg--err" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{error}</span>
          <button className="admin__btn admin__btn--sm" onClick={load}>Coba Lagi</button>
        </div>
      )}

      {/* COLLAPSIBLE IMPORT GEOJSON CARD */}
      {importOpen && (
        <div className="admin__card" style={{ border: '1px solid #c7d2fe', background: '#f8fafc', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <p className="admin__eyebrow" style={{ color: '#4338ca' }}>Impor Data Spasial</p>
              <h3 style={{ margin: 0 }}>Import Berkas GeoJSON</h3>
            </div>
            <button className="admin__btn admin__btn--sm admin__btn--ghost" onClick={() => setImportOpen(false)}>✕ Tutup</button>
          </div>

          {importError && <div className="admin__msg admin__msg--err">{importError}</div>}

          {importResult && (
            <div className="admin__result">
              <div className="admin__result-icon">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div className="admin__result-body">
                <strong>
                  {importResult.layer?.created
                    ? `Layer baru "${importResult.layer.nama_layer}" berhasil dibuat`
                    : `Import ke "${importResult.layer?.nama_layer}" berhasil`}
                </strong>
                <span>{importResult.imported} objek spasial telah diimport ke peta.</span>
              </div>
              <button className="admin__btn admin__btn--sm admin__btn--ghost" onClick={resetImport}>Import Lagi</button>
            </div>
          )}

          <form onSubmit={handleImportSubmit}>
            <div className="admin__form-grid" style={{ marginBottom: '1rem' }}>
              <div className="admin__field">
                <label>Pilih Layer Ada</label>
                <select
                  className="admin__select"
                  value={importSelectedLayerId}
                  onChange={(e) => {
                    setImportSelectedLayerId(e.target.value);
                    if (e.target.value) setImportLayerName('');
                  }}
                  disabled={importBusy}
                >
                  <option value="">— Atau Buat Layer Baru Di Bawah —</option>
                  {layers.map((l) => (
                    <option key={l.id} value={l.id}>{l.nama_layer} ({l.tipe})</option>
                  ))}
                </select>
              </div>

              <div className="admin__field">
                <label>Nama Layer Baru {!importSelectedLayerId && '*'}</label>
                <input
                  className="admin__input"
                  type="text"
                  value={importLayerName}
                  onChange={(e) => {
                    setImportLayerName(e.target.value);
                    if (e.target.value) setImportSelectedLayerId('');
                  }}
                  placeholder="Mis. Jalan Baru, Pemukiman RW 05…"
                  disabled={importBusy || Boolean(importSelectedLayerId)}
                />
              </div>
            </div>

            <div className="admin__field">
              <label>File GeoJSON (FeatureCollection)</label>
              <div
                className={`admin__dropzone ${dragOver ? 'admin__dropzone--over' : ''} ${importFile ? 'admin__dropzone--filled' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); handleImportFile(e.dataTransfer.files?.[0]); }}
                onClick={() => fileRef.current?.click()}
                role="button"
                tabIndex={0}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".geojson,.json,application/geo+json,application/json"
                  style={{ display: 'none' }}
                  onChange={(e) => handleImportFile(e.target.files?.[0] || null)}
                />
                {importFile ? (
                  <>
                    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#10b981" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><polyline points="14 2 14 8 20 8" />
                    </svg>
                    <div className="admin__dropzone-name">{importFile.name}</div>
                    <div className="admin__dropzone-sub">{(importFile.size / 1024).toFixed(1)} KB &bull; Klik untuk mengganti</div>
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ color: 'var(--admin-muted)' }}>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" />
                    </svg>
                    <div className="admin__dropzone-name">Tarik file GeoJSON ke sini atau klik untuk memilih</div>
                    <div className="admin__dropzone-sub">Format: .geojson / .json &bull; Maksimal 15 MB</div>
                  </>
                )}
              </div>

              {importPreview && (
                <div className="admin__preview" style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#fff', borderRadius: '6px', border: '1px solid var(--admin-border)' }}>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span className="admin__chip admin__chip--ok">{importPreview.total} fitur</span>
                    <span className="admin__chip admin__chip--soft">
                      {[
                        importPreview.counts.polygon && `${importPreview.counts.polygon} polygon`,
                        importPreview.counts.line && `${importPreview.counts.line} line`,
                        importPreview.counts.point && `${importPreview.counts.point} point`,
                      ].filter(Boolean).join(' · ')}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="button" onClick={resetImport} className="admin__btn admin__btn--ghost" disabled={importBusy}>Reset</button>
              <button className="admin__btn admin__btn--primary" disabled={importBusy || !importFile || (!importLayerName.trim() && !importSelectedLayerId)}>
                {importBusy ? <><span className="admin__spinner" /> Mengimpor…</> : 'Import Sekarang'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FILTER & TOOLBAR */}
      <div className="admin__card" style={{ padding: '0.875rem 1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px', maxWidth: '320px' }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-muted)' }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" x2="16.65" y1="21" y2="16.65" />
            </svg>
            <input
              className="admin__input"
              style={{ paddingLeft: '32px' }}
              placeholder="Cari nama layer atau grup…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className="admin__chip admin__chip--soft">{layers.length} Total</span>
            <span className="admin__chip admin__chip--ok">{layers.filter(l => l.is_active).length} Aktif</span>
          </div>
        </div>
      </div>

      {/* BULK ACTION BAR */}
      {selectedIds.length > 0 && (
        <div className="admin__bulk-bar">
          <span className="admin__bulk-info">{selectedIds.length} layer terpilih</span>
          <div className="admin__bulk-actions">
            <button className="admin__btn admin__btn--sm admin__btn--ghost" onClick={() => triggerBulkToggleStatus(true)}>
              Set Aktif
            </button>
            <button className="admin__btn admin__btn--sm admin__btn--ghost" onClick={() => triggerBulkToggleStatus(false)}>
              Set Nonaktif
            </button>
            <button className="admin__btn admin__btn--sm admin__btn--danger" onClick={triggerBulkDelete}>
              Hapus Terpilih
            </button>
          </div>
        </div>
      )}

      {/* TABLE */}
      {loading ? (
        <div className="admin__card">
          <div className="admin__skeleton-wrap">
            {[...Array(5)].map((_, i) => <div key={i} className="admin__skeleton" style={{ height: '48px', borderRadius: '6px' }} />)}
          </div>
        </div>
      ) : filteredAndSorted.length === 0 ? (
        <div className="admin__empty">
          <p style={{ fontWeight: 500, marginBottom: '0.25rem' }}>Tidak ada layer ditemukan.</p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--admin-muted)' }}>Coba kata kunci lain atau buat layer baru.</p>
        </div>
      ) : (
        <div className="admin__card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin__table">
              <thead>
                <tr>
                  <th style={{ width: '38px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.length === paginatedData.length && paginatedData.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th style={{ width: '60px', cursor: 'pointer' }} onClick={() => handleSort('urutan')}>
                    # {sortField === 'urutan' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{ width: '32px' }}></th>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('nama_layer')}>
                    Nama Layer {sortField === 'nama_layer' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('tipe')}>
                    Tipe {sortField === 'tipe' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('grup')}>
                    Grup {sortField === 'grup' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => handleSort('features_count')}>
                    Fitur {sortField === 'features_count' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((l) => (
                  <tr key={l.id} className={selectedIds.includes(l.id) ? 'admin__tr--selected' : ''}>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(l.id)}
                        onChange={() => toggleSelectOne(l.id)}
                      />
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--admin-muted)', fontSize: '0.8125rem' }}>{l.urutan}</td>
                    <td>
                      <span style={{
                        display: 'inline-block', width: '12px', height: '12px',
                        borderRadius: '50%', background: l.warna,
                        border: '1px solid rgba(0,0,0,0.1)', flexShrink: 0,
                      }} />
                    </td>
                    <td><strong style={{ fontWeight: 600 }}>{l.nama_layer}</strong></td>
                    <td>
                      <span style={{
                        padding: '0.175rem 0.5rem', borderRadius: '9999px',
                        fontSize: '0.75rem', fontWeight: 500,
                        background: TIPE_STYLE[l.tipe]?.bg || '#f4f4f5',
                        color: TIPE_STYLE[l.tipe]?.color || '#52525b',
                      }}>
                        {tipeLabel[l.tipe] || l.tipe}
                      </span>
                    </td>
                    <td style={{ color: 'var(--admin-muted)' }}>{l.grup || '—'}</td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{l.features_count ?? 0}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`admin__badge ${l.is_active ? 'admin__badge--on' : 'admin__badge--off'}`}>
                        {l.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td>
                      <div className="admin__table-actions" style={{ justifyContent: 'flex-end' }}>
                        <button className="admin__btn admin__btn--sm admin__btn--ghost" onClick={() => openImportForLayer(l)} title="Import data ke layer ini">
                          + Import
                        </button>
                        <button className="admin__btn admin__btn--sm admin__btn--ghost" onClick={() => navigate(`/admin/layers/${l.id}`)}>Edit</button>
                        <button className="admin__btn admin__btn--sm admin__btn--danger" onClick={() => triggerDeleteOne(l)}>Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={page}
            totalItems={filteredAndSorted.length}
            pageSize={pageSize}
            onPageChange={(p) => setPage(p)}
            onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
          />
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      <ConfirmModal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        onConfirm={modalState.action}
        onCancel={() => setModalState({ isOpen: false })}
        busy={modalBusy}
      />
    </>
  );
}
