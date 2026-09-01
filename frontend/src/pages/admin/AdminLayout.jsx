import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import './admin.css';

const ICON_DASH = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
    <rect x="3" y="3" width="7" height="9" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" />
    <rect x="3" y="16" width="7" height="5" rx="1" />
  </svg>
);

const ICON_LAYERS = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
    <path d="M12 3 21 8 18 19 6 19 3 8Z" />
    <path d="M12 3v16M3 8l9 4 9-4" />
  </svg>
);

const ICON_POI = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
    <path d="M12 21s-6-5.5-6-10a6 6 0 1 1 12 0c0 4.5-6 10-6 10Z" />
    <circle cx="12" cy="11" r="2.3" />
  </svg>
);

const ICON_IMPORT = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const ICON_LOGOUT = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const NAV = [
  { to: '/admin', end: true, label: 'Dashboard', icon: ICON_DASH },
  { to: '/admin/layers', label: 'Layers', icon: ICON_LAYERS },
  { to: '/admin/features', label: 'Fitur / POI', icon: ICON_POI },
  { to: '/admin/import', label: 'Import GeoJSON', icon: ICON_IMPORT },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return <Navigate to="/admin/login" replace />;

  function handleLogout() {
    logout();
    navigate('/admin/login');
  }

  return (
    <div className="admin admin__shell">
      <aside className="admin__sidebar">
        <div className="admin__sidebar-logo">
          <img src="/images/logo-desa.png" alt="Logo" />
          <div>
            <h1>SIG Cinunuk</h1>
            <small>Panel Admin</small>
          </div>
        </div>
        <nav className="admin__nav">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end}>
              <span className="admin__nav-icon" aria-hidden="true">{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin__sidebar-footer" onClick={handleLogout}>
          <span className="admin__nav-icon" aria-hidden="true" style={{ display: 'inline-grid', marginRight: '0.4rem', verticalAlign: '-3px' }}>
            {ICON_LOGOUT}
          </span>
          Keluar ({user.username})
        </div>
      </aside>
      <main className="admin__main">
        <Outlet />
      </main>
    </div>
  );
}
