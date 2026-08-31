import { Link } from 'react-router-dom'
import Reveal from '../components/Reveal'
import LegendShowcase from '../components/LegendShowcase'
import RandomNumber from '../components/RandomNumber'
import { SITE, STATISTIK } from '../data/siteConfig'
import './Home.css'

function splitChars(text) {
  return Array.from(text).map((ch, i) => ({
    ch: ch === ' ' ? '\u00A0' : ch,
    i,
  }))
}

export default function Home() {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero__photo">
          <img
            src="/images/hero-cinunuk.jpg"
            alt={`Pemandangan Desa ${SITE.desa}`}
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
          <div className="hero__shade" />
        </div>

        <div className="hero__inner">
          <div className="hero__panel">
            <p className="hero__eyebrow">
              Kabupaten {SITE.kabupaten} &mdash; Jawa Barat
            </p>
            <h1 className="hero__title">
              {splitChars('Peta Wilayah').map(({ ch, i }) => (
                <span key={i} className="hero__char" style={{ '--i': i }}>
                  {ch}
                </span>
              ))}
              <br />
              {splitChars(`Desa ${SITE.desa}`).map(({ ch }, idx) => (
                <span
                  key={idx}
                  className="hero__char"
                  style={{ '--i': 12 + idx }}
                >
                  {ch}
                </span>
              ))}
              <span className="hero__cursor" aria-hidden="true" />
            </h1>
            <p className="hero__tagline">{SITE.tagline}</p>

            <div className="hero__actions">
              <Link to="/peta" className="hero__cta">
                Buka Peta Interaktif
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                  <path
                    d="M5 12h14m-6-6 6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="stats__inner">
          {STATISTIK.map((s) => (
            <div key={s.label} className="stats__item">
              <span className="stats__num">
                <RandomNumber value={s.nilai} />
                <small> {s.satuan}</small>
              </span>
              <span className="stats__label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="about" id="tentang">
        <div className="about__inner">
          <div className="about__grid">
            <Reveal className="about__intro">
              <p className="about__eyebrow">Tentang Website</p>
              <h2>Sistem Informasi Geografis Desa {SITE.desa}</h2>
              <p className="about__lead">{SITE.deskripsi}</p>
              <ul className="about__list">
                <li>Informasi lokasi dan batas wilayah yang akurat dan mutakhir.</li>
                <li>Legenda peta yang mudah dipahami pengguna awam.</li>
                <li>Transparansi data kewilayahan untuk publik.</li>
              </ul>
              <div className="about__meta">
                <div>
                  <span className="about__meta-label">Pembaruan terakhir</span>
                  <span className="about__meta-value">{SITE.tanggalUpdate}</span>
                </div>
                <div>
                  <span className="about__meta-label">Penanggung jawab</span>
                  <span className="about__meta-value">Pemdes {SITE.desa}</span>
                </div>
              </div>
            </Reveal>

            <Reveal className="about__card" delay={120}>
              <h3>Data &amp; Sumber</h3>
              <dl className="about__dl">
                <div className="about__item">
                  <span className="about__item-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                      <path
                        d="M12 3 21 8 18 19 6 19 3 8Z"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinejoin="round"
                      />
                      <path d="M12 3v16M3 8l9 4 9-4" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <div className="about__item-text">
                    <dt>Batas administrasi</dt>
                    <dd>GeoJSON &mdash; {SITE.sumberData}</dd>
                  </div>
                </div>
                <div className="about__item">
                  <span className="about__item-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                      <path
                        d="M12 21s-6-5.5-6-10a6 6 0 1 1 12 0c0 4.5-6 10-6 10Z"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinejoin="round"
                      />
                      <circle cx="12" cy="11" r="2.3" stroke="currentColor" strokeWidth="1.7" />
                    </svg>
                  </span>
                  <div className="about__item-text">
                    <dt>Titik lokasi (POI)</dt>
                    <dd>Koordinat latitude/longitude verifikasi lapangan</dd>
                  </div>
                </div>
                <div className="about__item">
                  <span className="about__item-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                      <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="1.7" />
                      <path d="M3 9h18M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                    </svg>
                  </span>
                  <div className="about__item-text">
                    <dt>Pembaruan terakhir</dt>
                    <dd>{SITE.tanggalUpdate}</dd>
                  </div>
                </div>
                <div className="about__item">
                  <span className="about__item-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                      <path
                        d="M4 21V5l8-3 8 3v16"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinejoin="round"
                      />
                      <path d="M9 21v-6h6v6M9.5 11h.01M15 11h.01M9.5 15h.01M15 15h.01" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                    </svg>
                  </span>
                  <div className="about__item-text">
                    <dt>Penanggung jawab</dt>
                    <dd>Pemerintah Desa {SITE.desa}</dd>
                  </div>
                </div>
              </dl>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="guide">
        <div className="guide__inner">
          <Reveal>
            <div className="guide__head">
              <p className="guide__eyebrow">Panduan</p>
              <h2>Cara Membaca Peta</h2>
              <p>
                Peta terdiri dari dua elemen utama: <strong>batas wilayah</strong> berupa
                garis poligon, dan <strong>titik lokasi</strong> berupa penanda berwarna.
                Setiap warna menunjukkan kategori yang berbeda.
              </p>
            </div>
          </Reveal>

          <Reveal className="guide__legend-wrap" delay={80}>
            <LegendShowcase />
          </Reveal>

          <div className="guide__steps">
            <Reveal as="article" className="guide__step" delay={100}>
              <span className="guide__step-num">1</span>
              <div>
                <h3>Buka halaman peta</h3>
                <p>Tekan tombol &ldquo;Buka Peta Interaktif&rdquo; di atas.</p>
              </div>
            </Reveal>
            <Reveal as="article" className="guide__step" delay={220}>
              <span className="guide__step-num">2</span>
              <div>
                <h3>Jelajahi atau cari</h3>
                <p>Geser dan zoom peta, atau ketik nama lokasi pada pencarian.</p>
              </div>
            </Reveal>
            <Reveal as="article" className="guide__step" delay={340}>
              <span className="guide__step-num">3</span>
              <div>
                <h3>Klik untuk detail</h3>
                <p>Klik batas desa atau titik lokasi untuk melihat informasinya.</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="kontak">
        <div className="kontak__inner">
          <Reveal>
            <div className="kontak__head">
              <p className="kontak__eyebrow">Hubungi Kami</p>
              <h2>Kontak</h2>
              <p>
                Untuk koreksi data, usulan lokasi baru, atau pertanyaan seputar peta,
                silakan hubungi kami.
              </p>
            </div>
          </Reveal>

          <div className="kontak__items">
            <Reveal className="kontak__item-wrap" delay={80}>
              <a href={`mailto:${SITE.kontak.email}`} className="kontak__item">
                <span className="kontak__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
                    <path d="m3 7 9 6 9-6" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                </span>
                <span>
                  <strong>Email</strong>
                  {SITE.kontak.email}
                </span>
              </a>
            </Reveal>

            <Reveal className="kontak__item-wrap" delay={160}>
              <span className="kontak__item">
                <span className="kontak__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                    <path
                      d="M6 3h4l2 5-2.5 1.5a11 11 0 0 0 5 5L16 12l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                  </svg>
                </span>
                <span>
                  <strong>Telepon</strong>
                  {SITE.kontak.telepon}
                </span>
              </span>
            </Reveal>

            <Reveal className="kontak__item-wrap" delay={240}>
              <span className="kontak__item">
                <span className="kontak__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                    <path
                      d="M12 21s-6-5.5-6-10a6 6 0 1 1 12 0c0 4.5-6 10-6 10Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="11" r="2.4" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                </span>
                <span>
                  <strong>Alamat Kantor</strong>
                  Desa {SITE.desa}, Kec. {SITE.kecamatan}, Kab. {SITE.kabupaten}
                </span>
              </span>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  )
}
