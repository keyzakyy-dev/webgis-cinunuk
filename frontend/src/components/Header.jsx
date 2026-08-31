import { Link, NavLink } from 'react-router-dom'
import { SITE } from '../data/siteConfig'
import './Header.css'

const menu = [
  { to: '/', label: 'Beranda' },
  { to: '/peta', label: 'Peta' },
]

export default function Header() {
  return (
    <header className="header">
      <div className="header__main">
        <div className="header__main-inner">
          <Link to="/" className="header__brand">
            <img
              className="header__logo-img"
              src="/images/logo-desa.png"
              alt={`Logo Desa ${SITE.desa}`}
            />
            <span className="header__identity">
              <strong>Pemerintah Desa {SITE.desa}</strong>
              <small>
                Kec. {SITE.kecamatan} &middot; Kab. {SITE.kabupaten} &middot; Prov.{' '}
                {SITE.provinsi}
              </small>
            </span>
          </Link>

          <nav className="header__nav" aria-label="Navigasi utama">
            {menu.map((m) => (
              <NavLink
                key={m.to}
                to={m.to}
                end={m.to === '/'}
                className={({ isActive }) =>
                  'header__chip' + (isActive ? ' header__chip--active' : '')
                }
              >
                {m.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}
