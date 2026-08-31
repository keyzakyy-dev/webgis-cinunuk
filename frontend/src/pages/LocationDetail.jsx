import { createPortal } from 'react-dom'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { KATEGORI, POI_CONTOH, findPoi, getGeoPois } from '../data/siteConfig'
import { buatIkonMarker } from '../components/markerIcon'
import '../components/markerIcon.css'
import './LocationDetail.css'

function Foto({ src, label, warna }) {
  const [ok, setOk] = useState(true)
  const hasSrc = Boolean(src)
  return (
    <div className="foto" style={{ '--c': warna }}>
      {hasSrc && ok ? (
        <img src={src} alt={label} loading="lazy" onError={() => setOk(false)} />
      ) : (
        <div className="foto__placeholder">
          <svg viewBox="0 0 24 24" width="34" height="34" fill="none" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="8.5" cy="10" r="1.6" stroke="currentColor" strokeWidth="1.6" />
            <path d="m4 17 5-4 4 3 3-2 4 3" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
          <span>{label}</span>
          <small>Foto akan ditambahkan</small>
        </div>
      )}
    </div>
  )
}

export default function LocationDetail() {
  const { id } = useParams()
  const poi = findPoi(id)
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [coordCopied, setCoordCopied] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const navigate = useNavigate()
  const copyTimer = useRef(null)

  const fotoList = poi?.foto ?? []
  const totalFoto = fotoList.length

  useEffect(() => {
    setActive(0)
    setLightbox(false)
  }, [id])

  const geserFoto = useCallback(
    (arah) => {
      setActive((cur) => (cur + arah + totalFoto) % totalFoto)
    },
    [totalFoto],
  )

  useEffect(() => {
    if (!lightbox) return undefined
    function onKey(e) {
      if (e.key === 'Escape') setLightbox(false)
      else if (e.key === 'ArrowRight') geserFoto(1)
      else if (e.key === 'ArrowLeft') geserFoto(-1)
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [lightbox, geserFoto])

  if (!poi) {
    return (
      <div className="ld-notfound">
        <h1>Lokasi tidak ditemukan</h1>
        <Link to="/peta" className="ld-notfound__btn">
          ← Kembali ke Peta
        </Link>
      </div>
    )
  }

  const kat = KATEGORI[poi.kategori]
  const gmaps = `https://www.google.com/maps/search/?api=1&query=${poi.koordinat[0]},${poi.koordinat[1]}`

  const koordText = `${poi.koordinat[0]}, ${poi.koordinat[1]}`

  function flash(setter) {
    setter(true)
    clearTimeout(copyTimer.current)
    copyTimer.current = setTimeout(() => setter(false), 1600)
  }

  async function salinKoordinat() {
    try {
      await navigator.clipboard.writeText(koordText)
      flash(setCoordCopied)
    } catch {
      /* clipboard tidak tersedia */
    }
  }

  async function salinLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      flash(setLinkCopied)
    } catch {
      /* clipboard tidak tersedia */
    }
  }

  const shareWa = `https://wa.me/?text=${encodeURIComponent(`${poi.nama} — ${poi.alamat}\n${window.location.href}`)}`

  function bukaPetaUtama() {
    navigate('/peta', { state: { coords: poi.koordinat, poiId: poi.id } })
  }

  const lainnya = [...POI_CONTOH, ...getGeoPois()].filter((p) => String(p.id) !== String(poi.id))

  return (
    <div className="ld">
      <div className="ld__topbar">
        <nav className="ld__crumb" aria-label="Breadcrumb">
          <Link to="/">Beranda</Link>
          <span aria-hidden="true">/</span>
          <Link to="/peta">Peta</Link>
          <span aria-hidden="true">/</span>
          <span className="ld__crumb-current" aria-current="page">
            {poi.nama}
          </span>
        </nav>
        <Link to="/peta" className="ld__back">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
            <path d="M19 12H5m6-6-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Kembali ke Peta
        </Link>
      </div>

      <header className="ld__head">
        <span className="ld__badge" style={{ background: kat?.warna }}>
          {kat?.label}
        </span>
        <h1 className="ld__title">{poi.nama}</h1>
        <p className="ld__addr">{poi.alamat}</p>
      </header>

      {totalFoto > 0 && (
        <div className="ld__gallery">
          <button
            type="button"
            className="ld__gallery-main"
            onClick={() => setLightbox(true)}
            aria-label="Perbesar foto"
          >
            <Foto
              src={poi.foto?.[active]}
              label={`Foto ${poi.nama}`}
              warna={kat?.warna ?? '#292524'}
            />
            <span className="ld__gallery-zoom" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path d="m20 20-3.2-3.2M11 8v6M8 11h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
          </button>
          {poi.foto.length > 1 && (
            <div className="ld__thumbs">
              {poi.foto.map((f, i) => (
                <button
                  key={i}
                  type="button"
                  className={'ld__thumb' + (i === active ? ' ld__thumb--active' : '')}
                  onClick={() => {
                    setActive(i)
                    setLightbox(true)
                  }}
                  aria-label={`Foto ${i + 1}`}
                >
                  <Foto src={f} label={`Foto ${i + 1}`} warna={kat?.warna ?? '#292524'} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {lightbox && totalFoto > 0 && createPortal(
        <div
          className="lb"
          role="dialog"
          aria-modal="true"
          aria-label={`Foto ${active + 1} dari ${totalFoto}`}
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            className="lb__close"
            onClick={() => setLightbox(false)}
            aria-label="Tutup"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
              <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          {totalFoto > 1 && (
            <button
              type="button"
              className="lb__nav lb__nav--prev"
              onClick={(e) => {
                e.stopPropagation()
                geserFoto(-1)
              }}
              aria-label="Foto sebelumnya"
            >
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none">
                <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          <figure
            className="lb__stage"
            onClick={(e) => e.stopPropagation()}
          >
            <Foto
              src={poi.foto[active]}
              label={`Foto ${active + 1} ${poi.nama}`}
              warna={kat?.warna ?? '#292524'}
            />
            <figcaption className="lb__caption">
              <span>{poi.nama}</span>
              <span className="lb__count">
                {active + 1} / {totalFoto}
              </span>
            </figcaption>
          </figure>

          {totalFoto > 1 && (
            <button
              type="button"
              className="lb__nav lb__nav--next"
              onClick={(e) => {
                e.stopPropagation()
                geserFoto(1)
              }}
              aria-label="Foto berikutnya"
            >
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none">
                <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>,
        document.body,
      )}

      <div className="ld__grid">
        <div className="ld__content">
          <section
            className="ld__block ld__block--card"
            style={{ '--accent': kat?.warna ?? '#292524' }}
          >
            <p className="ld__eyebrow">Tentang Lokasi</p>
            <h2>Deskripsi</h2>
            <p className="ld__desc">{poi.deskripsiLengkap}</p>
          </section>

          <section
            className="ld__block"
            style={{ '--accent': kat?.warna ?? '#292524' }}
          >
            <p className="ld__eyebrow">Navigasi</p>
            <h2>Petunjuk Arah</h2>
            <ol className="ld__timeline">
              {poi.petunjukArah.map((step, i) => (
                <li key={i} className="ld__timeline-item">
                  <span className="ld__timeline-num">{i + 1}</span>
                  <div className="ld__timeline-body">
                    <p>{step}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="ld__aside">
          <div className="ld__info">
            <h3>Informasi</h3>
            <dl>
              <div>
                <dt>Kategori</dt>
                <dd>{kat?.label}</dd>
              </div>
              <div>
                <dt>Alamat</dt>
                <dd>{poi.alamat}</dd>
              </div>
              <div>
                <dt>Jam Layanan</dt>
                <dd>{poi.jamLayanan}</dd>
              </div>
              <div>
                <dt>Koordinat</dt>
                <dd className="ld__coords">
                  <span>{koordText}</span>
                  <button
                    type="button"
                    className="ld__copy"
                    onClick={salinKoordinat}
                    aria-label="Salin koordinat"
                  >
                    {coordCopied ? (
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true">
                        <path d="M5 12.5 10 17 19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true">
                        <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
                        <path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3" stroke="currentColor" strokeWidth="1.8" />
                      </svg>
                    )}
                  </button>
                </dd>
              </div>
            </dl>
            {coordCopied && <span className="ld__flash">Koordinat disalin</span>}

            <a href={gmaps} target="_blank" rel="noopener noreferrer" className="ld__gmaps">
              Buka di Google Maps
            </a>

            <div className="ld__actions">
              <button type="button" className="ld__action" onClick={bukaPetaUtama}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                  <path d="M12 21s-6-5.5-6-10a6 6 0 1 1 12 0c0 4.5-6 10-6 10Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  <circle cx="12" cy="11" r="2.3" stroke="currentColor" strokeWidth="1.8" />
                </svg>
                Lihat di Peta Utama
              </button>
              <button type="button" className="ld__action" onClick={salinLink}>
                {linkCopied ? 'Tautan disalin' : 'Salin Tautan'}
              </button>
              <a href={shareWa} target="_blank" rel="noopener noreferrer" className="ld__action ld__action--wa">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                  <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.7-1.2A9 9 0 1 0 12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  <path d="M8.5 9.5c0 4 2.5 6.5 6.5 6.5l1-1.5-2.2-1.2-1.1.8c-1.1-.6-1.8-1.3-2.3-2.3l.8-1.1L10 8.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                </svg>
                Bagikan WhatsApp
              </a>
            </div>
          </div>

          <div className="ld__minimap">
            <MapContainer
              center={poi.koordinat}
              zoom={17}
              scrollWheelZoom={false}
              className="ld__minimap-canvas"
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={poi.koordinat} icon={buatIkonMarker(poi.kategori)}>
                <Popup>{poi.nama}</Popup>
              </Marker>
            </MapContainer>
          </div>
        </aside>
      </div>

      {lainnya.length > 0 && (
        <section className="ld__related">
          <div className="ld__related-head">
            <h2>Lokasi Lainnya</h2>
            <Link to="/peta" className="ld__related-all">
              Semua Lokasi
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true">
                <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
          <div className="ld__related-grid">
            {lainnya.map((p, i) => {
              const k = KATEGORI[p.kategori]
              return (
                <Link
                  key={p.id}
                  to={`/lokasi/${p.id}`}
                  className="ld__card"
                  style={{ '--i': i }}
                >
                  <div className="ld__card-media">
                    <Foto
                      src={p.foto?.[0]}
                      label={p.nama}
                      warna={k?.warna ?? '#292524'}
                    />
                  </div>
                  <div className="ld__card-body">
                    <span className="ld__card-badge" style={{ background: k?.warna }}>
                      {k?.label}
                    </span>
                    <h3>{p.nama}</h3>
                    <p>{p.deskripsi}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
