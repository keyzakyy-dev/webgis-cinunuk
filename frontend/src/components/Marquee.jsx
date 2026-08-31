import { Link } from 'react-router-dom'
import { KATEGORI, POI_CONTOH } from '../data/siteConfig'
import './Marquee.css'

export default function Marquee() {
  const items = [...POI_CONTOH, ...POI_CONTOH]

  return (
    <div className="marquee" aria-label="Daftar lokasi Desa Cinunuk">
      <div className="marquee__label">
        <span className="marquee__pulse" aria-hidden="true" />
        Daftar Lokasi
      </div>
      <div className="marquee__viewport">
        <div className="marquee__track">
          {items.map((poi, i) => (
            <Link
              key={i}
              to={`/lokasi/${poi.id}`}
              className="marquee__item"
              onClick={(e) => e.stopPropagation()}
            >
              <span
                className="marquee__dot"
                style={{ background: KATEGORI[poi.kategori]?.warna }}
              />
              {poi.nama}
              <span className="marquee__cat">{KATEGORI[poi.kategori]?.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
