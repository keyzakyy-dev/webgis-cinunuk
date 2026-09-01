import { useState } from 'react';
import { Navigate, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import './admin.css';

const ICON_DASH = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
    <rect width="7" height="9" x="3" y="3" rx="1" />
    <rect width="7" height="5" x="14" y="3" rx="1" />
    <rect width="7" height="9" x="14" y="12" rx="1" />
    <rect width="7" height="5" x="3" y="16" rx="1" />
  </svg>
);

const ICON_LAYERS = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

const ICON_POI = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const ICON_LOGOUT = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
);

const NAV = [
  { to: '/admin', end: true, label: 'Dashboard', icon: ICON_DASH },
  { to: '/admin/layers', label: 'Layer Peta', icon: ICON_LAYERS },
  { to: '/admin/features', label: 'Data Fitur & POI', icon: ICON_POI },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return <Navigate to="/admin/login" replace />;

  function handleLogout() {
    logout();
    navigate('/admin/login');
  }

  return (
    <div className="admin admin__shell">
      {/* Mobile Top Appbar */}
      <header className="admin__mobile-header">
        <div className="admin__mobile-brand">
          <img src="/images/logo-desa.png" alt="Logo" />
          <span className="admin__mobile-title">SIG Cinunuk</span>
        </div>
        <button
          type="button"
          className="admin__mobile-toggle"
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          )}
        </button>
      </header>

      {/* Backdrop for mobile drawer */}
      {mobileMenuOpen && (
        <div className="admin__sidebar-backdrop" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar Drawer */}
      <aside className={`admin__sidebar ${mobileMenuOpen ? 'admin__sidebar--open' : ''}`}>
        <div className="admin__sidebar-logo">
          <img src="/images/logo-desa.png" alt="Logo" />
          <div style={{ minWidth: 0 }}>
            <h1>SIG Cinunuk</h1>
            <small>Panel Pengelola</small>
          </div>
        </div>
        <nav className="admin__nav">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="admin__nav-icon" aria-hidden="true">{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin__sidebar-footer" onClick={handleLogout} title="Keluar">
          <span className="admin__nav-icon" aria-hidden="true">
            {ICON_LOGOUT}
          </span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Keluar ({user.username})
          </span>
        </div>
      </aside>

      <main className="admin__main">
        <Outlet key={location.pathname} />
      </main>
    </div>
  );
}
