import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { API_URL } from '../data/siteConfig'
import './Marquee.css'

function kategoriForLayer(layerName) {
  const n = (layerName || '').toLowerCase()
  if (n.includes('sekolah')) return '#16a34a'
  if (n.includes('ibadah') || n.includes('masjid')) return '#8b5cf6'
  if (n.includes('puskesmas') || n.includes('kesehatan')) return '#f59e0b'
  if (n.includes('kantor')) return '#dc2626'
  return '#0891b2'
}

export default function Marquee() {
  const [items, setItems] = useState([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`${API_URL}/api/features`)
        const json = await res.json()
        if (json?.success && !cancelled) {
          setItems(json.data.filter((f) => f.is_active).slice(0, 30))
        }
      } catch { /* offline — tampilkan kosong */ }
    })()
    return () => { cancelled = true }
  }, [])

  if (items.length === 0) return null

  const loop = items.length >= 5 ? [...items, ...items] : items

  return (
    <div className="marquee" aria-label="Daftar lokasi Desa Cinunuk">
      <div className="marquee__label">
        <span className="marquee__pulse" aria-hidden="true" />
        Daftar Lokasi
      </div>
      <div className="marquee__viewport">
        <div className="marquee__track">
          {loop.map((poi, i) => (
            <Link
              key={i}
              to={`/lokasi/${poi.id}`}
              className="marquee__item"
              onClick={(e) => e.stopPropagation()}
            >
              <span
                className="marquee__dot"
                style={{ background: kategoriForLayer(poi.layer_name) }}
              />
              {poi.nama}
              <span className="marquee__cat">{poi.layer_name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}