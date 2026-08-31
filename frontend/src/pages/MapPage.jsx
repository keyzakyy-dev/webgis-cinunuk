import { useEffect, useRef, useState } from 'react'
import MapView from '../components/MapView'
import PoiList from '../components/PoiList'
import SearchBox from '../components/SearchBox'
import Loading from '../components/Loading'
import { Link, useNavigate } from 'react-router-dom'
import { KATEGORI, POI_CONTOH, LAYERS, LAYER_KATEGORI, setGeoPois, getGeoPois, findPoi, SITE, API_URL } from '../data/siteConfig'
import './MapPage.css'

const DEFAULT_LAYERS = LAYERS.filter((l) => l.defaultOn).map((l) => l.id)
const { desa: SITE_NAMA_DESA, kecamatan: SITE_KECAMATAN, kabupaten: SITE_KABUPATEN } = SITE

function geoFeatureToPoi(layerDef, feature, index) {
  const lat = feature.geometry.coordinates[1]
  const lng = feature.geometry.coordinates[0]
  const kategori = LAYER_KATEGORI[layerDef.id] ?? 'umum'
  const nama = feature.properties?.Name || layerDef.label
  return {
    id: `${layerDef.id}-${index}`,
    nama,
    kategori,
    koordinat: [lat, lng],
    deskripsi: `${nama} merupakan ${layerDef.label.toLowerCase()} di Desa ${SITE_NAMA_DESA}.`,
    deskripsiLengkap:
      `${nama} merupakan ${layerDef.label.toLowerCase()} yang berada di Desa ${SITE_NAMA_DESA}, Kec. ${SITE_KECAMATAN}, Kab. ${SITE_KABUPATEN}. Lokasi ini dapat ditemukan pada peta wilayah desa.`,
    alamat: `Desa ${SITE_NAMA_DESA}, Kec. ${SITE_KECAMATAN}, Kab. ${SITE_KABUPATEN}`,
    jamLayanan: 'Sesuai jam operasional setempat',
    foto: [],
    petunjukArah: [
      `Lokasi terletak di Desa ${SITE_NAMA_DESA}, Kec. ${SITE_KECAMATAN}, Kab. ${SITE_KABUPATEN}.`,
      `Klik "Google Maps" pada popup untuk melihat rute menuju ${nama}.`,
    ],
  }
}

export default function MapPage() {
  const [layerData, setLayerData] = useState({})
  const [activeLayers, setActiveLayers] = useState(DEFAULT_LAYERS)
  const [activeKategori, setActiveKategori] = useState(null)
  const [selectedPoiId, setSelectedPoiId] = useState(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [layersOpen, setLayersOpen] = useState(false)
  const mapApiRef = useRef(null)
  const layersRef = useRef(null)
  const navigate = useNavigate()

  const searchLocations = getGeoPois().map((p) => ({
    id: p.id,
    nama: p.nama,
    sub: KATEGORI[p.kategori]?.label ?? 'Lokasi',
    coords: p.koordinat,
  }))

  // Memuat data layer. Sumber: API backend, fallback ke file statis.
  useEffect(() => {
    let cancelled = false

    // Peta nama layer (backend) → id layer di DB
    function mapToData(apiLayers) {
      const byName = {}
      for (const l of apiLayers) byName[l.nama_layer] = l.id
      return byName
    }

    async function load() {
      // 1. Coba ambil daftar layer dari API
      let byName = null
      try {
        const res = await fetch(`${API_URL}/api/layers?all=1`)
        const json = await res.json()
        if (json?.success) byName = mapToData(json.data)
      } catch {
        byName = null
      }

      // 2. Ambil GeoJSON tiap layer (dari API jika ada, else file statis)
      const entries = await Promise.all(
        LAYERS.map(async (l) => {
          if (byName && byName[l.label] != null) {
            try {
              const r = await fetch(`${API_URL}/api/layers/${byName[l.label]}`)
              const j = await r.json()
              if (j?.success && j.data?.geojson) return [l.id, j.data.geojson]
            } catch {
              /* fallback ke file */
            }
          }
          try {
            const r = await fetch(l.file)
            return r.ok ? [l.id, await r.json()] : [l.id, null]
          } catch {
            return [l.id, null]
          }
        })
      )

      if (cancelled) return
      const data = {}
      entries.filter(Boolean).forEach(([id, d]) => {
        data[id] = d
      })
      setLayerData(data)

      const geoPois = []
      for (const layer of LAYERS) {
        if (layer.type !== 'point') continue
        const ld = data[layer.id]
        if (!ld) continue
        const pts = (ld.features || []).filter((f) => f.geometry?.type === 'Point')
        pts.forEach((f, i) => geoPois.push(geoFeatureToPoi(layer, f, i)))
      }
      setGeoPois(geoPois)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const raf = requestAnimationFrame(() => mapApiRef.current?.invalidateSize())
    const t = setTimeout(() => mapApiRef.current?.invalidateSize(), 350)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(t)
    }
  }, [panelOpen])

  useEffect(() => {
    if (!layersOpen) return
    function onDown(e) {
      if (layersRef.current && !layersRef.current.contains(e.target)) setLayersOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [layersOpen])

  const allPois = [...POI_CONTOH, ...getGeoPois()]
  const selectedPoi = findPoi(selectedPoiId)

  function toggleLayer(id) {
    setActiveLayers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  function handleSelect(id) {
    setSelectedPoiId(id)
    const poi = findPoi(id)
    if (poi) setActiveKategori(null)
    const markerPoi = POI_CONTOH.find((p) => p.id === id)
    if (markerPoi) {
      mapApiRef.current?.flyToPoi(id)
    } else if (poi?.koordinat) {
      mapApiRef.current?.flyToCoords(poi.koordinat)
    }
  }

  function handleSearchPick(item) {
    if (item.id != null && item.type !== 'desa') {
      navigate(`/lokasi/${item.id}`)
    } else if (item.type === 'desa') {
      mapApiRef.current?.resetView()
    }
  }

  return (
    <div className={'mappage' + (panelOpen ? '' : ' mappage--closed')}>
      <aside className={'mappage__panel' + (panelOpen ? ' mappage__panel--open' : '')}>
        <div className="mappage__panel-bars">
          <button
            type="button"
            className="mappage__bars"
            onClick={() => setPanelOpen((v) => !v)}
            aria-label={panelOpen ? 'Tutup panel' : 'Buka panel'}
            aria-expanded={panelOpen}
          >
            <span />
            <span />
            <span />
          </button>
          <span className="mappage__panel-title">
            {selectedPoi ? selectedPoi.nama : 'Daftar Lokasi'}
          </span>
        </div>

        {selectedPoi ? (
          <div className="mappage__info">
            <div className="mappage__info-kategori">
              <span
                className="mappage__info-dot"
                style={{ background: KATEGORI[selectedPoi.kategori]?.warna }}
              />
              {KATEGORI[selectedPoi.kategori]?.label}
            </div>
            <p className="mappage__info-desc">{selectedPoi.deskripsi}</p>
            <Link
              to={`/lokasi/${selectedPoi.id}`}
              className="mappage__info-btn"
            >
              Lihat Detail
            </Link>
          </div>
        ) : (
          <PoiList
            poiList={allPois}
            selectedId={selectedPoiId}
            onSelect={handleSelect}
          />
        )}
      </aside>

      <div className="mappage__map">
        {Object.keys(layerData).length === 0 && <Loading text="Memuat data wilayah…" />}
        <MapView
          ref={mapApiRef}
          poiList={POI_CONTOH}
          layerData={layerData}
          activeLayers={activeLayers}
          kategoriAktif={activeKategori}
          onSelectPoi={setSelectedPoiId}
        />

        <div className="mappage__search">
          <SearchBox
            placeholder="Cari lokasi, mis. kantor desa…"
            onPick={handleSearchPick}
            extraLocations={searchLocations}
          />
        </div>

        <div className="layerpanel" ref={layersRef}>
          <button
            type="button"
            className={'layerpanel__trigger' + (layersOpen ? ' layerpanel__trigger--on' : '')}
            onClick={() => setLayersOpen((v) => !v)}
            aria-label="Panel layer"
            aria-expanded={layersOpen}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
              <path d="M12 3 2 8l10 5 10-5-10-5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M2 13l10 5 10-5M2 17.5l10 5 10-5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
            {activeLayers.length > 0 && <span className="layerpanel__badge">{activeLayers.length}</span>}
          </button>

          {layersOpen && (
            <div className="layerpanel__dropdown" role="group" aria-label="Filter layer peta">
              {Object.entries(
                LAYERS.reduce((acc, l) => {
                  ;(acc[l.group] = acc[l.group] || []).push(l)
                  return acc
                }, {})
              ).map(([group, layers]) => (
                <div key={group} className="layerpanel__group">
                  <span className="layerpanel__group-title">{group}</span>
                  {layers.map((l) => {
                    const on = activeLayers.includes(l.id)
                    return (
                      <button
                        key={l.id}
                        type="button"
                        className={'layerpanel__row' + (on ? ' layerpanel__row--on' : '')}
                        onClick={() => toggleLayer(l.id)}
                        aria-pressed={on}
                      >
                        <span
                          className="layerpanel__swatch"
                          style={l.style.dashArray
                            ? { borderBottom: '2px dashed ' + l.legendColor }
                            : { background: l.legendColor }}
                        />
                        <span className="layerpanel__label">{l.label}</span>
                        <span className="layerpanel__check" aria-hidden="true">
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
                            <path d="M5 12.5 10 17 19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {!panelOpen && (
          <button
            type="button"
            className="mappage__reopen"
            onClick={() => setPanelOpen(true)}
            aria-label="Buka daftar lokasi"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
              <path
                d="M4 6h16M4 12h16M4 18h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
