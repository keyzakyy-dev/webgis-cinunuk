import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';

const TYPE_LABEL = { polygon: 'Polygon', line: 'Line', point: 'Point' };

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [layersRes, statsRes] = await Promise.all([
          api.get('/api/layers?all=1'),
          api.get('/api/stats'),
        ]);
        const layers = layersRes.data || [];
        setStats({
          layers: layers.length,
          activeLayers: layers.filter((l) => l.is_active).length,
          ...statsRes.data,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const perLayer = stats?.perLayer || [];
  const maxCount = Math.max(1, ...perLayer.map((r) => Number(r.jumlah)));
  const topLayers = [...perLayer].sort((a, b) => b.jumlah - a.jumlah).slice(0, 7);

  const totalLayers = stats?.layers || 0;
  const activeLayers = stats?.activeLayers || 0;
  const inactiveLayers = Math.max(0, totalLayers - activeLayers);
  const activeRatio = totalLayers ? activeLayers / totalLayers : 0;
  const R = 34;
  const C = 2 * Math.PI * R;

  return (
    <>
      <p className="admin__eyebrow">Admin</p>
      <h2>Dashboard</h2>
      {error && <div className="admin__msg admin__msg--err">{error}</div>}
      {loading ? (
        <p>Memuat…</p>
      ) : (
        <>
          <div className="admin__stats">
            <div className="admin__stat">
              <div className="admin__stat-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
                  <path d="M12 3 21 8 18 19 6 19 3 8Z" />
                  <path d="M12 3v16M3 8l9 4 9-4" />
                </svg>
              </div>
              <div className="admin__stat-label">Total Layer</div>
              <div className="admin__stat-value">{totalLayers}</div>
              <div className="admin__stat-sub">Layer pada peta</div>
            </div>
            <div className="admin__stat">
              <div className="admin__stat-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <div className="admin__stat-label">Layer Aktif</div>
              <div className="admin__stat-value">{activeLayers}</div>
              <div className="admin__stat-sub">Ditampilkan ke publik</div>
            </div>
            <div className="admin__stat">
              <div className="admin__stat-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
                  <path d="M12 21s-6-5.5-6-10a6 6 0 1 1 12 0c0 4.5-6 10-6 10Z" />
                  <circle cx="12" cy="11" r="2.3" />
                </svg>
              </div>
              <div className="admin__stat-label">Total Fitur / POI</div>
              <div className="admin__stat-value">{stats.totalFitur}</div>
              <div className="admin__stat-sub">Titik lokasi terdaftar</div>
            </div>
            <div className="admin__stat">
              <div className="admin__stat-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
                  <path d="M3 3v18h18" />
                  <path d="m7 14 4-4 3 3 5-6" />
                </svg>
              </div>
              <div className="admin__stat-label">Titik Lokasi Aktif</div>
              <div className="admin__stat-value">{stats.titikLokasi}</div>
              <div className="admin__stat-sub">POI tampil di peta</div>
            </div>
          </div>

          <div className="admin__charts">
            <div className="admin__card admin__chart-card">
              <p className="admin__eyebrow">Distribusi</p>
              <h3>Fitur per Layer</h3>
              {topLayers.length === 0 ? (
                <p className="admin__empty" style={{ padding: '1.5rem' }}>Belum ada data fitur.</p>
              ) : (
                <ul className="admin__bars">
                  {topLayers.map((r) => (
                    <li key={r.nama_layer} className="admin__bar-row">
                      <div className="admin__bar-head">
                        <span className="admin__bar-label" title={r.nama_layer}>{r.nama_layer}</span>
                        <span className="admin__bar-meta">{TYPE_LABEL[r.tipe] || r.tipe} · {r.jumlah}</span>
                      </div>
                      <div className="admin__bar-track">
                        <div
                          className="admin__bar-fill"
                          style={{
                            width: `${Math.round((Number(r.jumlah) / maxCount) * 100)}%`,
                            background: r.warna || '#292524',
                          }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="admin__card admin__chart-card">
              <p className="admin__eyebrow">Ringkasan</p>
              <h3>Status Layer</h3>
              <div className="admin__donut-wrap">
                <div className="admin__donut">
                  <svg viewBox="0 0 90 90" width="120" height="120" role="img" aria-label={`${activeLayers} dari ${totalLayers} layer aktif`}>
                    <circle cx="45" cy="45" r={R} fill="none" stroke="#e7e5e4" strokeWidth="10" />
                    <circle
                      cx="45"
                      cy="45"
                      r={R}
                      fill="none"
                      stroke="#292524"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${(activeRatio * C).toFixed(1)} ${C.toFixed(1)}`}
                      transform="rotate(-90 45 45)"
                      style={{ transition: 'stroke-dasharray 0.6s cubic-bezier(0.22, 1, 0.36, 1)' }}
                    />
                    <text x="45" y="42" textAnchor="middle" className="admin__donut-num">{activeLayers}</text>
                    <text x="45" y="56" textAnchor="middle" className="admin__donut-sub">aktif</text>
                  </svg>
                </div>
                <div className="admin__donut-legend">
                  <div className="admin__donut-item">
                    <span className="admin__donut-dot" style={{ background: '#292524' }} />
                    <span>Aktif</span>
                    <strong>{activeLayers}</strong>
                  </div>
                  <div className="admin__donut-item">
                    <span className="admin__donut-dot" style={{ background: '#e7e5e4' }} />
                    <span>Nonaktif</span>
                    <strong>{inactiveLayers}</strong>
                  </div>
                  <div className="admin__donut-note">
                    {totalLayers ? Math.round(activeRatio * 100) : 0}% dari total layer tampil di peta publik
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="admin__card" style={{ marginTop: '0.5rem' }}>
        <p className="admin__eyebrow">Navigasi</p>
        <div className="admin__actions">
          <Link to="/admin/layers" className="admin__action">
            <div className="admin__action-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
                <path d="M12 3 21 8 18 19 6 19 3 8Z" />
                <path d="M12 3v16M3 8l9 4 9-4" />
              </svg>
            </div>
            <span className="admin__action-label">Kelola Layer</span>
            <span className="admin__action-desc">Tambah, edit, atau nonaktifkan layer pada peta</span>
          </Link>
          <Link to="/admin/features" className="admin__action">
            <div className="admin__action-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
                <path d="M12 21s-6-5.5-6-10a6 6 0 1 1 12 0c0 4.5-6 10-6 10Z" />
                <circle cx="12" cy="11" r="2.3" />
              </svg>
            </div>
            <span className="admin__action-label">Kelola Fitur / POI</span>
            <span className="admin__action-desc">Kelola titik lokasi pada setiap layer</span>
          </Link>
          <Link to="/admin/import" className="admin__action">
            <div className="admin__action-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <span className="admin__action-label">Import GeoJSON</span>
            <span className="admin__action-desc">Massal impor data fitur dari file GeoJSON</span>
          </Link>
        </div>
      </div>
    </>
  );
}
