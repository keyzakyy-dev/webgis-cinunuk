import { useEffect, useRef, useState } from 'react'
import MapView from '../components/MapView'
import PoiList from '../components/PoiList'
import SearchBox from '../components/SearchBox'
import Loading from '../components/Loading'
import { Link, useNavigate } from 'react-router-dom'
import { SITE } from '../data/siteConfig'
import { api } from '../api'
import './MapPage.css'

const { desa: SITE_NAMA_DESA, kecamatan: SITE_KECAMATAN, kabupaten: SITE_KABUPATEN } = SITE

function buildLayerId(name) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function parsePetunjukArah(raw) {
  if (!raw) return []
  try {
    const v = JSON.parse(raw)
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

// Layer dari backend menjadi definisi layer yang dikonsumsi MapView
function layersFromApi(apiLayers) {
  return apiLayers.map((l) => ({
    id: buildLayerId(l.nama_layer),
    label: l.nama_layer,
    type: l.tipe,
    group: l.grup || 'Lainnya',
    style: {
      color: l.warna || '#292524',
      weight: 2,
      fillColor: l.warna || '#292524',
      fillOpacity: 0.1,
      ...(l.tipe === 'point' ? { radius: 8 } : {}),
    },
    legendSymbol: l.tipe === 'point' ? 'marker' : l.tipe === 'line' ? 'line' : 'polygon',
    legendColor: l.warna || '#292524',
    defaultOn: !!l.is_active,
    apiId: l.id,
  }))
}

function kategoriForLayer(layerName) {
  const n = (layerName || '').toLowerCase()
  if (n.includes('sekolah')) return { key: 'pendidikan', label: 'Fasilitas Pendidikan', warna: '#16a34a' }
  if (n.includes('ibadah') || n.includes('masjid') || n.includes('gereja') || n.includes('mushola')) return { key: 'ibadah', label: 'Tempat Ibadah', warna: '#8b5cf6' }
  if (n.includes('puskesmas') || n.includes('kesehatan') || n.includes('posyandu')) return { key: 'kesehatan', label: 'Fasilitas Kesehatan', warna: '#f59e0b' }
  if (n.includes('kantor') || n.includes('pemerintahan') || n.includes('pemdes')) return { key: 'pemerintahan', label: 'Kantor Pemerintahan', warna: '#dc2626' }
  return { key: 'umum', label: 'Fasilitas Umum', warna: '#0891b2' }
}

function featureToPoi(feature) {
  // Hanya fitur dari layer point yang jadi POI marker
  if (feature.layer_type !== 'point') return null

  let geom = null;
  if (feature.geometry) {
    try {
      geom = typeof feature.geometry === 'string' ? JSON.parse(feature.geometry) : feature.geometry;
    } catch (err) {
      console.warn('Invalid geometry JSON for feature ID:', feature.id);
    }
  }
  let c = geom?.coordinates
  let lat = parseFloat(feature.lat)
  let lng = parseFloat(feature.lng)

  if (isNaN(lat) || isNaN(lng)) {
    if (c) {
      while (c && Array.isArray(c[0])) c = c[0]
      if (c && c.length >= 2) {
        lng = parseFloat(c[0])
        lat = parseFloat(c[1])
      }
    }
  }

  if (isNaN(lat) || isNaN(lng)) return null

  const kat = kategoriForLayer(feature.layer_name)
  const foto = [feature.foto_1, feature.foto_2, feature.foto_3].filter(Boolean)
  const deskripsi = feature.deskripsi || `${feature.nama} merupakan ${(feature.layer_name || 'lokasi').toLowerCase()} di Desa ${SITE_NAMA_DESA}.`
  const alamat = feature.alamat || `Desa ${SITE_NAMA_DESA}, Kec. ${SITE_KECAMATAN}, Kab. ${SITE_KABUPATEN}`

  return {
    id: feature.id,
    nama: feature.nama,
    kategori: kat.key,
    kategoriColor: kat.warna,
    kategoriLabel: kat.label,
    layerId: feature.layer_id,
    koordinat: [lat, lng],
    deskripsi,
    deskripsiLengkap: feature.deskripsi_lengkap || deskripsi,
    alamat,
    jamLayanan: feature.jam_layanan || 'Sesuai jam operasional setempat',
    foto,
    petunjukArah: parsePetunjukArah(feature.petunjuk_arah),
  }
}

export default function MapPage() {
  const [mergedLayers, setMergedLayers] = useState([])
  const [layerData, setLayerData] = useState({})
  const [pois, setPois] = useState([])
  const [activeLayers, setActiveLayers] = useState([])
  const [activeKategori, setActiveKategori] = useState(null)
  const [selectedPoiId, setSelectedPoiId] = useState(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [layersOpen, setLayersOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState('')
  const mapApiRef = useRef(null)
  const layersRef = useRef(null)
  const navigate = useNavigate()

  const searchLocations = pois.map((p) => ({
    id: p.id,
    nama: p.nama,
    sub: p.kategoriLabel,
    coords: p.koordinat,
  }))

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const json = await api.get('/api/layers?all=1')
        if (!json?.success) throw new Error('Gagal memuat data')
        const apiLayers = json.data
        const merged = layersFromApi(apiLayers)
        if (cancelled) return
        setMergedLayers(merged)
        setActiveLayers(merged.filter((l) => l.defaultOn).map((l) => l.id))

        const entries = await Promise.all(
          merged.map(async (l) => {
            try {
              const j = await api.get(`/api/layers/${l.apiId}`)
              if (j?.success && j.data?.geojson) return [l.id, j.data.geojson]
            } catch { /* lewati layer yang gagal */ }
            return [l.id, null]
          })
        )
        if (cancelled) return
        const data = {}
        entries.filter(Boolean).forEach(([id, d]) => { data[id] = d })
        setLayerData(data)

        const fj = await api.get('/api/features')
        if (!fj?.success) throw new Error('Gagal memuat fitur')
        const allPois = fj.data.map(featureToPoi).filter(Boolean)
        if (cancelled) return
        setPois(allPois)
      } catch (err) {
        if (!cancelled) setError(err.message || 'Backend tidak dapat dihubungi')
      } finally {
        if (!cancelled) setLoaded(true)
      }
    }

    load()
    return () => { cancelled = true }
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

  const selectedPoi = pois.find((p) => String(p.id) === String(selectedPoiId)) || null

  const visiblePois = activeKategori === null
    ? pois
    : pois.filter((p) => p.kategori === activeKategori)

  function toggleLayer(id) {
    setActiveLayers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  function handleSelect(id) {
    setSelectedPoiId(id)
    const poi = pois.find((p) => String(p.id) === String(id))
    if (poi) setActiveKategori(null)
    if (poi?.koordinat) mapApiRef.current?.flyToCoords(poi.koordinat)
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
                style={{ background: selectedPoi.kategoriColor }}
              />
              {selectedPoi.kategoriLabel}
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
            poiList={visiblePois}
            selectedId={selectedPoiId}
            onSelect={handleSelect}
          />
        )}
      </aside>

      <div className="mappage__map">
        {!loaded && !error && <Loading text="Memuat data wilayah…" />}
        {error && <div className="mappage__error">{error}</div>}
        <MapView
          ref={mapApiRef}
          poiList={visiblePois}
          layerData={layerData}
          activeLayers={activeLayers}
          layerDefs={mergedLayers}
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
                mergedLayers.reduce((acc, l) => {
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