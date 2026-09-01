import { useEffect, useState } from 'react'
import { API_URL } from '../data/siteConfig'
import './LegendShowcase.css'

export default function LegendShowcase() {
  const [items, setItems] = useState([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`${API_URL}/api/layers?all=1`)
        const json = await res.json()
        if (json?.success && !cancelled) {
          setItems(
            json.data
              .filter((l) => l.is_active)
              .map((l) => ({
                warna: l.warna || '#292524',
                tipe: l.tipe,
                label: l.nama_layer,
              }))
          )
        }
      } catch { /* backend tidak tersedia */ }
    })()
    return () => { cancelled = true }
  }, [])

  if (items.length === 0) return null

  return (
    <div className="lshow">
      <div className="lshow__head">
        <h3 className="lshow__title">Keterangan Simbol</h3>
        <span className="lshow__hint">Berlaku di seluruh peta desa</span>
      </div>

      <div className="lshow__grid">
        {items.map((item) => (
          <div key={item.label} className="lshow__cell" style={{ '--c': item.warna }}>
            <span className={'lshow__symbol lshow__symbol--' + item.tipe} aria-hidden="true" />
            <div className="lshow__text">
              <strong>{item.label}</strong>
              <span>{item.tipe === 'polygon' ? 'Area polygon' : item.tipe === 'line' ? 'Jaringan linear' : 'Titik lokasi'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}