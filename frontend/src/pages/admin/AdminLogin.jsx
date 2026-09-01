import { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import './admin.css';

export default function AdminLogin() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPass, setShowPass] = useState(false);

  if (user) return <Navigate to="/admin" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(username, password);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Username atau password tidak sesuai');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-page">
      {/* Sisi Kiri: Hero Canvas GIS Abstrak (Desktop) */}
      <div className="login-hero">
        {/* Vector SVG Contour & Coordinate Grid Background */}
        <div className="login-hero__svg-bg" aria-hidden="true">
          <svg className="login-hero__contour" viewBox="0 0 800 800" fill="none">
            {/* Contour lines */}
            <path d="M-100 200 C 150 100, 350 350, 600 200 C 750 100, 850 250, 950 200" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
            <path d="M-100 300 C 100 250, 300 450, 550 300 C 700 200, 800 380, 950 320" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
            <path d="M-100 420 C 180 320, 380 520, 620 380 C 780 280, 840 480, 950 420" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />
            <path d="M-100 550 C 220 450, 420 620, 680 480 C 800 380, 880 580, 950 520" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />
            
            {/* GIS Polygon Area Feature */}
            <polygon points="160,280 320,240 440,340 380,480 220,460" fill="rgba(99,102,241,0.08)" stroke="rgba(99,102,241,0.3)" strokeWidth="1.5" strokeDasharray="4 4" />
            <polygon points="460,180 620,150 710,240 650,330 510,280" fill="rgba(14,165,233,0.06)" stroke="rgba(14,165,233,0.25)" strokeWidth="1.5" />
            
            {/* GIS Line Route Feature */}
            <path d="M 80 520 L 220 460 L 380 480 L 520 410 L 680 480 L 780 430" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
            
            {/* Radius Signal Circles */}
            <circle cx="380" cy="480" r="70" stroke="rgba(16,185,129,0.25)" strokeWidth="1.5" fill="rgba(16,185,129,0.03)" />
            <circle cx="380" cy="480" r="140" stroke="rgba(16,185,129,0.12)" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="380" cy="480" r="6" fill="#10b981" />
            <circle cx="380" cy="480" r="12" fill="none" stroke="#10b981" strokeWidth="1.5" className="login-hero__pulse-ring" />

            {/* POI Node Points */}
            <g opacity="0.85">
              <circle cx="160" cy="280" r="4" fill="#6366f1" />
              <circle cx="320" cy="240" r="4" fill="#6366f1" />
              <circle cx="440" cy="340" r="4" fill="#6366f1" />
              <circle cx="220" cy="460" r="4" fill="#6366f1" />
              <circle cx="520" cy="410" r="5" fill="#f59e0b" />
              <circle cx="680" cy="480" r="5" fill="#f59e0b" />
            </g>
          </svg>
        </div>

        <div className="login-hero__content">
          <div>
            <div className="login-hero__badge">
              <span className="login-hero__dot" />
              Portal Pengelola Spasial
            </div>

            <div className="login-hero__brand">
              <img src="/images/logo-desa.png" alt="Logo Desa Cinunuk" className="login-hero__logo" />
              <div>
                <h1 className="login-hero__title">SIG Desa Cinunuk</h1>
                <p className="login-hero__sub">Kecamatan Cileunyi &bull; Kabupaten Bandung</p>
              </div>
            </div>

            <p className="login-hero__desc">
              Sistem Informasi Geografis terintegrasi untuk pengelolaan layer peta, pemetaan fasilitas desa, batas administrasi RW, dan analisis spasial publik.
            </p>

            {/* Feature Cards Grid */}
            <div className="login-hero__features">
              <div className="login-hero__feat-card">
                <div className="login-hero__feat-icon" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                </div>
                <div>
                  <strong>Manajemen Layer</strong>
                  <span>Polygon, Rute, & POI</span>
                </div>
              </div>

              <div className="login-hero__feat-card">
                <div className="login-hero__feat-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" x2="12" y1="15" y2="3" />
                  </svg>
                </div>
                <div>
                  <strong>Import GeoJSON</strong>
                  <span>Impor Berkas Spasial</span>
                </div>
              </div>
            </div>
          </div>

          <div className="login-hero__footer">
            <Link to="/peta" className="login-hero__back-link">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" x2="5" y1="12" y2="12" /><polyline points="12 19 5 12 12 5" />
              </svg>
              Lihat Peta Publik
            </Link>
          </div>
        </div>
      </div>

      {/* Sisi Kanan: Form Authentication */}
      <div className="login-form-wrapper">
        <div className="login-form-card">
          {/* Logo khusus tampilan mobile */}
          <div className="login-mobile-brand">
            <img src="/images/logo-desa.png" alt="Logo" />
            <div>
              <strong>SIG Desa Cinunuk</strong>
              <span>Panel Pengelola</span>
            </div>
          </div>

          <div className="login-form-header">
            <div className="login-form-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h2>Masuk Pengelola</h2>
            <p>Masukkan kredensial akun administrator untuk mengelola data spasial.</p>
          </div>

          {error && (
            <div className="login-alert login-alert--error" role="alert">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
                <circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="admin__field">
              <label>Username</label>
              <div className="login-input-wrap">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="login-input-icon">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  className="admin__input login-input-field"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                  autoComplete="username"
                  placeholder="admin"
                />
              </div>
            </div>

            <div className="admin__field">
              <label>Password</label>
              <div className="login-input-wrap">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="login-input-icon">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  className="admin__input login-input-field"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  className="login-pass-toggle"
                  onClick={() => setShowPass((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPass ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPass ? (
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="admin__btn admin__btn--primary login-submit-btn"
              disabled={busy}
            >
              {busy ? (
                <>
                  <span className="admin__spinner" />
                  <span>Memverifikasi…</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Dashboard</span>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" x2="19" y1="12" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="login-form-footer">
            <Link to="/peta" className="login-mobile-back-link">
              ← Kembali ke Peta Publik
            </Link>
            <span style={{ fontSize: '0.75rem', color: 'var(--admin-muted)', display: 'block', marginTop: '0.5rem' }}>
              Pemerintah Desa Cinunuk &bull; Hak Cipta &copy; {new Date().getFullYear()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
