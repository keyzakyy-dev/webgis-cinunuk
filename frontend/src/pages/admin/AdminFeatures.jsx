import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useToast } from '../../context/ToastContext.jsx';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import ConfirmModal from '../../components/ConfirmModal.jsx';
import Pagination from '../../components/Pagination.jsx';
import { exportToCsv } from '../../utils/exportCsv.js';
import './admin.css';

export default function AdminFeatures() {
  const [features, setFeatures] = useState([]);
  const [layers, setLayers] = useState([]);
  const [filterLayer, setFilterLayer] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Sorting & Pagination
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Bulk action state
  const [selectedIds, setSelectedIds] = useState([]);

  // Modal State
  const [modalState, setModalState] = useState({ isOpen: false, title: '', message: '', type: 'danger', action: null });
  const [modalBusy, setModalBusy] = useState(false);

  const navigate = useNavigate();
  const toast = useToast();

  const load = useCallback(async (layerId) => {
    setLoading(true);
    setError('');
    try {
      const url = layerId
        ? `/api/features?layer_id=${layerId}&include_inactive=1`
        : '/api/features?include_inactive=1';
      const res = await api.get(url);
      setFeatures(res.data || []);
      setSelectedIds([]);
    } catch (err) {
      setError(err.message || 'Gagal memuat data fitur');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    api.get('/api/layers?all=1').then((r) => setLayers(r.data || []));
  }, []);

  useEffect(() => {
    load(filterLayer || undefined);
  }, [filterLayer, load]);

  // Sort & Filter
  const filteredAndSorted = useMemo(() => {
    let result = features.filter((f) =>
      f.nama.toLowerCase().includes(search.toLowerCase()) ||
      (f.deskripsi || '').toLowerCase().includes(search.toLowerCase()) ||
      (f.kategori || '').toLowerCase().includes(search.toLowerCase())
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
  }, [features, search, sortField, sortOrder]);

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
      setSelectedIds(paginatedData.map((f) => f.id));
    }
  }

  function toggleSelectOne(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  function triggerDeleteOne(f) {
    setModalState({
      isOpen: true,
      title: 'Hapus Fitur Spasial?',
      message: `Apakah Anda yakin ingin menghapus fitur "${f.nama}"?`,
      type: 'danger',
      action: async () => {
        setModalBusy(true);
        try {
          await api.del(`/api/features/${f.id}`);
          toast.showToast(`Fitur "${f.nama}" berhasil dihapus.`, { type: 'success' });
          load(filterLayer || undefined);
        } catch (err) {
          toast.showToast(err.message || 'Gagal menghapus fitur', { type: 'error' });
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
      title: `Hapus ${selectedIds.length} Fitur Terpilih?`,
      message: `Tindakan ini akan menghapus ${selectedIds.length} objek fitur spasial terpilih. Data yang dihapus tidak bisa dikembalikan.`,
      type: 'danger',
      action: async () => {
        setModalBusy(true);
        try {
          await Promise.all(selectedIds.map((id) => api.del(`/api/features/${id}`)));
          toast.showToast(`${selectedIds.length} fitur berhasil dihapus.`, { type: 'success' });
          load(filterLayer || undefined);
        } catch (err) {
          toast.showToast('Gagal menghapus beberapa fitur', { type: 'error' });
        } finally {
          setModalBusy(false);
          setModalState({ isOpen: false });
        }
      },
    });
  }

  function handleExportCsv() {
    exportToCsv(
      'daftar_fitur_poi_sig_cinunuk',
      filteredAndSorted,
      [
        { key: 'id', label: 'ID' },
        { key: 'nama', label: 'Nama Fitur' },
        { key: 'layer_name', label: 'Layer' },
        { key: 'kategori', label: 'Kategori' },
        { key: 'deskripsi', label: 'Deskripsi Singkat' },
        { key: 'alamat', label: 'Alamat' },
        { key: 'lat', label: 'Latitude' },
        { key: 'lng', label: 'Longitude' },
        { key: 'is_active', label: 'Aktif' },
      ]
    );
    toast.showToast('Data fitur berhasil diexport ke CSV.', { type: 'success' });
  }

  return (
    <>
      <Breadcrumbs items={[{ label: 'Fitur & POI' }]} />

      <div className="admin__pagehead">
        <div>
          <p className="admin__eyebrow">Manajemen Spasial</p>
          <h2 style={{ margin: 0 }}>Fitur & POI</h2>
        </div>
        <div className="admin__pagehead-actions">
          <button className="admin__btn admin__btn--ghost" onClick={handleExportCsv} disabled={features.length === 0}>
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" />
            </svg>
            Export CSV
          </button>
          <Link to="/admin/features/new" className="admin__btn admin__btn--primary">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" x2="12" y1="5" y2="19" /><line x1="5" x2="19" y1="12" y2="12" />
            </svg>
            Tambah Fitur
          </Link>
        </div>
      </div>

      {error && <div className="admin__msg admin__msg--err">{error}</div>}

      {/* FILTER TOOLBAR */}
      <div className="admin__card" style={{ padding: '0.875rem 1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flex: 1, minWidth: '280px' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-muted)' }}>
                <circle cx="11" cy="11" r="8" /><line x1="21" x2="16.65" y1="21" y2="16.65" />
              </svg>
              <input
                className="admin__input"
                style={{ paddingLeft: '32px' }}
                placeholder="Cari fitur, POI, atau kategori…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <select
              className="admin__select"
              value={filterLayer}
              onChange={(e) => { setFilterLayer(e.target.value); setPage(1); }}
              style={{ maxWidth: '220px' }}
            >
              <option value="">Semua Layer</option>
              {layers.map((l) => (
                <option key={l.id} value={l.id}>{l.nama_layer}</option>
              ))}
            </select>
          </div>
          <span className="admin__chip admin__chip--soft">
            {filteredAndSorted.length} dari {features.length} data
          </span>
        </div>
      </div>

      {/* BULK ACTION BAR */}
      {selectedIds.length > 0 && (
        <div className="admin__bulk-bar">
          <span className="admin__bulk-info">{selectedIds.length} fitur terpilih</span>
          <div className="admin__bulk-actions">
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
            {[...Array(6)].map((_, i) => <div key={i} className="admin__skeleton" style={{ height: '48px', borderRadius: '6px' }} />)}
          </div>
        </div>
      ) : filteredAndSorted.length === 0 ? (
        <div className="admin__empty">
          <p style={{ fontWeight: 500, marginBottom: '0.25rem' }}>Tidak ada fitur ditemukan.</p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--admin-muted)' }}>Coba ubah kata kunci pencarian atau buat fitur baru.</p>
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
                  <th style={{ width: '48px', textAlign: 'center', cursor: 'pointer' }} onClick={() => handleSort('id')}>
                    ID {sortField === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('nama')}>
                    Nama Fitur {sortField === 'nama' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('layer_name')}>
                    Kategori & Layer {sortField === 'layer_name' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{ textAlign: 'center' }}>Koordinat</th>
                  <th style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => handleSort('is_active')}>
                    Status {sortField === 'is_active' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((f) => (
                  <tr key={f.id}>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(f.id)}
                        onChange={() => toggleSelectOne(f.id)}
                      />
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 500, color: 'var(--admin-muted)', fontSize: '0.8125rem' }}>{f.id}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--admin-text)' }}>{f.nama}</div>
                      {f.deskripsi && (
                        <div style={{ fontSize: '0.78125rem', color: 'var(--admin-muted)', maxWidth: '340px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={f.deskripsi}>
                          {f.deskripsi}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span className="admin__chip admin__chip--soft" style={{ fontWeight: 500 }}>
                          {f.layer_name}
                        </span>
                        {f.kategori && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--admin-muted)' }}>· {f.kategori}</span>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--admin-muted)', fontFamily: 'monospace' }}>
                      {f.lat && f.lng ? `${parseFloat(f.lat).toFixed(4)}, ${parseFloat(f.lng).toFixed(4)}` : '—'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`admin__badge ${f.is_active ? 'admin__badge--on' : 'admin__badge--off'}`}>
                        {f.is_active ? 'Aktif' : 'Off'}
                      </span>
                    </td>
                    <td>
                      <div className="admin__table-actions" style={{ justifyContent: 'flex-end' }}>
                        <button className="admin__btn admin__btn--sm admin__btn--ghost" onClick={() => navigate(`/admin/features/${f.id}`)}>Edit</button>
                        <button className="admin__btn admin__btn--sm admin__btn--danger" onClick={() => triggerDeleteOne(f)}>Hapus</button>
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
