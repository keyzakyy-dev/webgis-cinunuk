import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext.jsx';

const TYPE_CONFIG = {
  polygon: { label: 'Polygon (Area)', color: '#6366f1', bg: '#eef2ff' },
  line: { label: 'Line (Garis/Rute)', color: '#f59e0b', bg: '#fffbeb' },
  point: { label: 'Point (POI/Titik)', color: '#10b981', bg: '#ecfdf5' },
};

function Sk({ w = '100%', h = '1rem', r = '6px', style = {} }) {
  return <div className="admin__skeleton" style={{ width: w, height: h, borderRadius: r, ...style }} />;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [layersRes, statsRes, logsRes] = await Promise.all([
        api.get('/api/layers?all=1'),
        api.get('/api/stats'),
        api.get('/api/logs?limit=6').catch(() => ({ data: [] })),
      ]);
      const data = layersRes.data || [];
      const actLayers = data.filter((l) => Number(l.is_active) === 1).length;
      setLogs(logsRes.data || []);
      setStats({
        layers: data.length,
        activeLayers: actLayers,
        ...statsRes.data,
      });
    } catch (err) {
      setError(err.message || 'Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const perLayer = stats?.perLayer || [];
  const maxLayerCount = Math.max(1, ...perLayer.map((r) => Number(r.jumlah)));
  const topLayers = [...perLayer].sort((a, b) => b.jumlah - a.jumlah).slice(0, 6);

  const byType = stats?.byType || { polygon: 0, line: 0, point: 0 };
  const totalByType = (byType.polygon || 0) + (byType.line || 0) + (byType.point || 0) || 1;

  const totalLayers = stats?.layers || 0;
  const activeLayers = stats?.activeLayers || 0;
  const inactiveLayers = Math.max(0, totalLayers - activeLayers);
  const activeRatio = totalLayers ? activeLayers / totalLayers : 0;
  const R = 32;
  const C = 2 * Math.PI * R;

  const hour = new Date().getHours();
  const greeting = hour < 11 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 18 ? 'Selamat sore' : 'Selamat malam';

  return (
    <div className="dash">
      <div className="dash__header">
        <div className="dash__greeting">
          <p className="dash__greeting-sub">{greeting}, <strong>{user?.username || 'Admin'}</strong></p>
          <h2 className="dash__greeting-title">Dashboard Analitik Spasial</h2>
          <p className="dash__greeting-date">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="dash__header-actions">
          <Link to="/peta" className="admin__btn admin__btn--ghost" target="_blank" rel="noreferrer">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Buka Peta Publik
          </Link>
          <button className="admin__btn admin__btn--ghost" onClick={load} disabled={loading}>
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={loading ? 'dash__spin' : ''}>
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            {loading ? 'Memuat…' : 'Perbarui'}
          </button>
        </div>
      </div>

      {error && (
        <div className="admin__msg admin__msg--err" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{error}</span>
          <button className="admin__btn admin__btn--sm" onClick={load}>Coba Lagi</button>
        </div>
      )}

      {/* STAT CARDS */}
      <div className="dash__stats">
        {loading ? (
          [0, 1, 2, 3].map((i) => (
            <div key={i} className="dash__stat-card">
              <Sk w="2.25rem" h="2.25rem" r="8px" style={{ marginBottom: '0.75rem' }} />
              <Sk w="45%" h="0.75rem" style={{ marginBottom: '0.35rem' }} />
              <Sk w="35%" h="1.75rem" style={{ marginBottom: '0.25rem' }} />
              <Sk w="65%" h="0.65rem" />
            </div>
          ))
        ) : (
          <>
            <div className="dash__stat-card">
              <div className="dash__stat-icon" style={{ background: '#eef2ff', color: '#6366f1' }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
                </svg>
              </div>
              <div className="dash__stat-label">Total Layer</div>
              <div className="dash__stat-value">{totalLayers}</div>
              <div className="dash__stat-sub">{activeLayers} aktif · {inactiveLayers} nonaktif</div>
            </div>

            <div className="dash__stat-card">
              <div className="dash__stat-icon" style={{ background: '#f0f9ff', color: '#0ea5e9' }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div className="dash__stat-label">Total Fitur Spasial</div>
              <div className="dash__stat-value">{stats?.totalFitur ?? 0}</div>
              <div className="dash__stat-sub">Polygon, Garis, & Titik POI</div>
            </div>

            <div className="dash__stat-card">
              <div className="dash__stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <div className="dash__stat-label">Titik Lokasi Aktif</div>
              <div className="dash__stat-value">{stats?.titikLokasi ?? 0}</div>
              <div className="dash__stat-sub">Tampil pada modul peta publik</div>
            </div>

            <div className="dash__stat-card">
              <div className="dash__stat-icon" style={{ background: '#fffbeb', color: '#f59e0b' }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div className="dash__stat-label">Rasio Layer Aktif</div>
              <div className="dash__stat-value">{totalLayers ? Math.round((activeLayers / totalLayers) * 100) : 0}%</div>
              <div className="dash__stat-sub">{activeLayers} dari {totalLayers} layer aktif</div>
            </div>
          </>
        )}
      </div>

      {/* CHARTS ROW 1 */}
      <div className="dash__charts-row">
        <div className="admin__card" style={{ flex: 1, marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <p className="admin__eyebrow">Komposisi Geometri</p>
              <h3 style={{ margin: 0 }}>Tipe Fitur Spasial</h3>
            </div>
            <span className="admin__chip admin__chip--soft">{stats?.totalFitur ?? 0} Total Objek</span>
          </div>

          {loading ? (
            <Sk h="90px" r="8px" />
          ) : (
            <>
              <div className="dash__geom-stack">
                <div style={{ width: `${((byType.polygon || 0) / totalByType) * 100}%`, background: TYPE_CONFIG.polygon.color }} title={`Polygon: ${byType.polygon}`} />
                <div style={{ width: `${((byType.line || 0) / totalByType) * 100}%`, background: TYPE_CONFIG.line.color }} title={`Line: ${byType.line}`} />
                <div style={{ width: `${((byType.point || 0) / totalByType) * 100}%`, background: TYPE_CONFIG.point.color }} title={`Point: ${byType.point}`} />
              </div>

              <div className="dash__geom-legend">
                {['polygon', 'line', 'point'].map((k) => {
                  const val = byType[k] || 0;
                  const pct = Math.round((val / totalByType) * 100);
                  const conf = TYPE_CONFIG[k];
                  return (
                    <div key={k} className="dash__geom-item">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                        <span className="dash__geom-dot" style={{ background: conf.color }} />
                        <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{conf.label}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                        <strong style={{ fontSize: '1.25rem', fontWeight: 700 }}>{val}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--admin-muted)' }}>({pct}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="admin__card" style={{ width: '320px', minWidth: '260px', marginBottom: 0 }}>
          <p className="admin__eyebrow">Status Visibilitas</p>
          <h3 style={{ margin: '0 0 1rem' }}>Rasio Publik Layer</h3>
          {loading ? (
            <Sk h="100px" r="8px" />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
                <svg viewBox="0 0 80 80" width="80" height="80">
                  <circle cx="40" cy="40" r={R} fill="none" stroke="var(--admin-border)" strokeWidth="8" />
                  {activeLayers > 0 && (
                    <circle
                      cx="40" cy="40" r={R} fill="none"
                      stroke="#6366f1" strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={`${(activeRatio * C).toFixed(2)} ${C.toFixed(2)}`}
                      transform="rotate(-90 40 40)"
                      style={{ transition: 'stroke-dasharray 0.6s ease' }}
                    />
                  )}
                  <text x="40" y="38" textAnchor="middle" style={{ fontSize: '14px', fontWeight: 700, fill: 'var(--admin-text)' }}>
                    {totalLayers ? Math.round(activeRatio * 100) : 0}%
                  </text>
                  <text x="40" y="50" textAnchor="middle" style={{ fontSize: '7px', fill: 'var(--admin-muted)', fontWeight: 600 }}>
                    PUBLIK
                  </text>
                </svg>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--admin-muted)' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1', flexShrink: 0 }} />
                    Aktif
                  </span>
                  <strong>{activeLayers} layer</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--admin-muted)' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--admin-border)', flexShrink: 0 }} />
                    Nonaktif
                  </span>
                  <strong>{inactiveLayers} layer</strong>
                </div>
                <div style={{ borderTop: '1px solid var(--admin-border-subtle)', paddingTop: '0.35rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.78125rem', color: 'var(--admin-muted)' }}>
                  <span>Total Terdaftar</span>
                  <strong>{totalLayers}</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CHARTS ROW 2 & ACTIVITY LOG */}
      <div className="dash__charts-row">
        <div className="admin__card" style={{ flex: 1, marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <p className="admin__eyebrow">Peringkat Data</p>
              <h3 style={{ margin: 0 }}>Layer Terpadat</h3>
            </div>
            <Link to="/admin/layers" className="admin__btn admin__btn--ghost admin__btn--sm">Kelola Layer →</Link>
          </div>

          {loading ? (
            <div className="admin__skeleton-wrap">
              {[0, 1, 2, 3, 4].map((i) => <Sk key={i} h="32px" r="6px" />)}
            </div>
          ) : topLayers.length === 0 ? (
            <div className="dash__empty-inline">Belum ada layer yang terisi fitur.</div>
          ) : (
            <ul className="dash__bars">
              {topLayers.map((r) => {
                const pct = Math.round((Number(r.jumlah) / maxLayerCount) * 100);
                return (
                  <li key={r.nama_layer} className="dash__bar-row">
                    <div className="dash__bar-info">
                      <span className="dash__bar-dot" style={{ background: r.warna || '#18181b' }} />
                      <span className="dash__bar-name">{r.nama_layer}</span>
                      <span className="dash__bar-type">{TYPE_CONFIG[r.tipe]?.label || r.tipe}</span>
                      <span className="dash__bar-count">{r.jumlah} objek</span>
                    </div>
                    <div className="dash__bar-track">
                      <div className="dash__bar-fill" style={{ width: `${pct}%`, background: r.warna || '#6366f1' }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* LOG AKTIVITAS TERAKHIR WIDGET */}
        <div className="admin__card" style={{ flex: 1, marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <p className="admin__eyebrow">Audit Trail</p>
              <h3 style={{ margin: 0 }}>Aktivitas Terakhir</h3>
            </div>
            <span className="admin__chip admin__chip--soft">Sistem Log</span>
          </div>

          {loading ? (
            <div className="admin__skeleton-wrap">
              {[0, 1, 2, 3].map((i) => <Sk key={i} h="36px" r="6px" />)}
            </div>
          ) : logs.length === 0 ? (
            <div className="dash__empty-inline">Belum ada riwayat aktivitas.</div>
          ) : (
            <div className="dash__log-list">
              {logs.map((log) => (
                <div key={log.id} className="dash__log-item">
                  <div className="dash__log-dot-wrap">
                    <div className="dash__log-dot" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="dash__log-action">
                      {log.action} <span style={{ fontWeight: 400, color: 'var(--admin-muted)' }}>oleh</span> {log.user_name}
                    </div>
                    {log.details && <div className="dash__log-detail">{log.details}</div>}
                    <div className="dash__log-meta">
                      {new Date(log.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
