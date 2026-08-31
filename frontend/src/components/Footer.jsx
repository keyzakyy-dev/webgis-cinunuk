import { Link } from 'react-router-dom'
import { SITE } from '../data/siteConfig'
import './Footer.css'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__grid">
          <div className="footer__brand">
            <img
              className="footer__logo-img"
              src="/images/logo-desa.png"
              alt={`Logo Desa ${SITE.desa}`}
            />
            <div className="footer__identity">
              <strong>Pemerintah Desa {SITE.desa}</strong>
              <span>
                Kecamatan {SITE.kecamatan} &middot; Kabupaten {SITE.kabupaten} &middot;{' '}
                {SITE.provinsi}
              </span>
            </div>
          </div>

          <div className="footer__col">
            <h5>Navigasi</h5>
            <ul>
              <li>
                <Link to="/">Beranda</Link>
              </li>
              <li>
                <Link to="/peta">Peta Interaktif</Link>
              </li>
              <li>
                <Link
                  to="/"
                  onClick={() =>
                    setTimeout(
                      () => document.getElementById('tentang')?.scrollIntoView({ behavior: 'smooth' }),
                      60,
                    )
                  }
                >
                  Tentang &amp; Kontak
                </Link>
              </li>
            </ul>
          </div>

          <div className="footer__col">
            <h5>Data &amp; Sumber</h5>
            <p>{SITE.sumberData}</p>
            <p className="footer__update">Terakhir diperbarui: {SITE.tanggalUpdate}</p>
          </div>

          <div className="footer__col">
            <h5>Kontak</h5>
            <ul>
              <li>
                <a href={`mailto:${SITE.kontak.email}`}>
                  <span className="footer__ico" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none">
                      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
                      <path d="m3 7 9 6 9-6" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                  </span>
                  {SITE.kontak.email}
                </a>
              </li>
              <li>
                <span className="footer__plain">
                  <span className="footer__ico" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none">
                      <path
                        d="M6 3h4l2 5-2.5 1.5a11 11 0 0 0 5 5L16 12l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                    </svg>
                  </span>
                  {SITE.kontak.telepon}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <span>
            &copy; {year} Pemerintah Desa {SITE.desa}. Hak cipta dilindungi.
          </span>
          <span className="footer__madeby">
            Sistem Informasi Geografis Wilayah &middot; {SITE.kecamatan}, {SITE.kabupaten}
          </span>
        </div>
      </div>
    </footer>
  )
}
