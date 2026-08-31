import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { POI_CONTOH, SITE } from '../data/siteConfig'
import './SearchBox.css'

export default function SearchBox({ placeholder = 'Cari lokasi…', onPick, extraLocations = [] }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const boxRef = useRef(null)
  const navigate = useNavigate()

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    const desa = `${SITE.desa} ${SITE.kecamatan} ${SITE.kabupaten}`.toLowerCase()
    const list = []
    if (desa.includes(q)) {
      list.push({
        type: 'desa',
        nama: `Desa ${SITE.desa}`,
        sub: `${SITE.kecamatan}, ${SITE.kabupaten}`,
        coords: null,
        id: null,
      })
    }
    for (const poi of POI_CONTOH) {
      if (poi.nama.toLowerCase().includes(q)) {
        list.push({
          type: 'poi',
          id: poi.id,
          nama: poi.nama,
          sub: poi.deskripsi,
          coords: poi.koordinat,
        })
      }
    }
    for (const loc of extraLocations) {
      if (loc.nama.toLowerCase().includes(q) && !list.some((x) => x.nama === loc.nama)) {
        list.push({
          type: 'geopoi',
          nama: loc.nama,
          sub: loc.sub,
          coords: loc.coords,
          id: loc.id,
        })
      }
    }
    return list.slice(0, 10)
  }, [query, extraLocations])

  function pick(item) {
    setQuery('')
    setOpen(false)
    if (onPick) {
      onPick(item)
    } else {
      navigate('/peta', {
        state: {
          cari: item.nama,
          coords: item.coords,
          type: item.type,
        },
      })
    }
  }

  return (
    <div className="searchbox" ref={boxRef}>
      <svg
        className="searchbox__icon"
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
        <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <input
        className="searchbox__input"
        type="search"
        value={query}
        placeholder={placeholder}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        aria-label="Cari lokasi"
      />
      {open && results.length > 0 && (
        <ul className="searchbox__results">
          {results.map((r, i) => (
            <li key={i}>
              <button
                type="button"
                className="searchbox__result"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(r)}
              >
                <strong>{r.nama}</strong>
                <span>{r.sub}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
