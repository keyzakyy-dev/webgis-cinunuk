import { Link } from 'react-router-dom';

export default function Breadcrumbs({ items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="admin__breadcrumb">
      <ol style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', listStyle: 'none', margin: 0, padding: 0 }}>
        <li>
          <Link to="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--admin-muted)', fontSize: '0.8125rem' }}>
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Admin
          </Link>
        </li>
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ color: 'var(--admin-border)', fontSize: '0.75rem' }}>/</span>
              {isLast || !item.to ? (
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--admin-text)' }}>
                  {item.label}
                </span>
              ) : (
                <Link to={item.to} style={{ fontSize: '0.8125rem', color: 'var(--admin-muted)' }}>
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
