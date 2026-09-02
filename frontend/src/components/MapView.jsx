import { useEffect, useRef, useImperativeHandle, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { GeoJSON, MapContainer, Marker, Popup, Circle, Polyline, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MAP_CONFIG, SITE } from '../data/siteConfig'
import { buatIkonMarker } from './markerIcon'
import './markerIcon.css'
import './MapView.css'

const BASEMAPS = [
  {
    id: 'osm',
    name: 'Standard',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
  {
    id: 'satellite',
    name: 'Satelit',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  },
  {
    id: 'carto-light',
    name: 'Terang',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO',
  },
  {
    id: 'carto-dark',
    name: 'Gelap',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO',
  },
]

function styleGeoJson(layerDef, opacity = 1) {
  return () => {
    const s = { ...layerDef.style }
    if (layerDef.type !== 'point') delete s.radius
    s.opacity = opacity
    s.fillOpacity = (s.fillOpacity || 0.2) * opacity
    return s
  }
}

function sanitizeGeometry(geom) {
  if (!geom || typeof geom !== 'object') return null
  if (geom.type === 'Feature' && geom.geometry) return sanitizeGeometry(geom.geometry)
  const valid = ['Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon', 'GeometryCollection']
  if (!valid.includes(geom.type)) return null
  if (geom.type === 'Polygon') {
    const rings = (geom.coordinates || []).filter(
      (r) => Array.isArray(r) && r.length >= 4 && r.every((p) => Array.isArray(p) && p.length >= 2)
    )
    if (rings.length === 0) return null
    return { ...geom, coordinates: rings }
  }
  if (geom.type === 'MultiPolygon') {
    const polys = (geom.coordinates || [])
      .map((poly) => (poly || []).filter((r) => Array.isArray(r) && r.length >= 4))
      .filter((poly) => poly.length > 0)
    if (polys.length === 0) return null
    return { ...geom, coordinates: polys }
  }
  if (geom.type === 'LineString') {
    const coords = (geom.coordinates || []).filter((p) => Array.isArray(p) && p.length >= 2)
    if (coords.length < 2) return null
    return { ...geom, coordinates: coords }
  }
  return geom
}

function sanitizeGeoJson(data) {
  if (!data || !Array.isArray(data.features)) return data
  const features = data.features
    .map((f) => {
      const geometry = sanitizeGeometry(f.geometry)
      if (!geometry) return null
      return { ...f, geometry }
    })
    .filter(Boolean)
  return { ...data, features }
}

function LayerGeoJson({ layerDef, data, opacity = 1 }) {
  const safeData = useMemo(() => sanitizeGeoJson(data), [data])
  if (!data || !safeData) return null
  const styleFn = styleGeoJson(layerDef, opacity)
  const onEachFeature = (feature, layer) => {
    const name = feature?.properties?.Name || layerDef.label
    if (layer.bindTooltip) {
      layer.bindTooltip(name, { sticky: true, direction: 'top', offset: [0, -4] })
    }
  }
  return (
    <GeoJSON
      key={`${layerDef.id}-${opacity}`}
      data={safeData}
      style={styleFn}
      onEachFeature={onEachFeature}
    />
  )
}

function BasemapTileLayer({ basemapId }) {
  const map = useMap()
  const tileLayerRef = useRef(null)

  useEffect(() => {
    if (!map) return

    const config = BASEMAPS.find((b) => b.id === basemapId) || BASEMAPS[0]

    // Hapus semua tile layer yang ada di map
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer)
      }
    })

    // Tambah tile layer baru
    const newLayer = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: 19,
      crossOrigin: true,
    })

    newLayer.addTo(map)
    tileLayerRef.current = newLayer

    return () => {
      if (tileLayerRef.current && map.hasLayer(tileLayerRef.current)) {
        map.removeLayer(tileLayerRef.current)
      }
    }
  }, [map, basemapId])

  return null
}

// Map Click Listener Component for Measurement & Radius Placement
function MapEventsHandler({ isMeasuring, isSettingRadiusCenter, onMapClick }) {
  useMapEvents({
    click(e) {
      if (isMeasuring || isSettingRadiusCenter) {
        onMapClick(e.latlng)
      }
    },
  })
  return null
}

// Distance Calculation Helper (Haversine formula in meters)
function calcDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000 // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c)
}

export default function MapView({
  ref,
  poiList,
  layerData = {},
  activeLayers = [],
  layerDefs = [],
  layerOpacities = {},
  kategoriAktif,
  onSelectPoi,
  height = '100%',
  radiusFilter = null, // { center: [lat, lng], radiusMeters: 500 }
  onSetRadiusCenter,
}) {
  const mapRef = useRef(null)
  const markerRefs = useRef({})
  const location = useLocation()
  const navigate = useNavigate()

  // Basemap State
  const [selectedBasemap, setSelectedBasemap] = useState('osm')
  const [basemapOpen, setBasemapOpen] = useState(false)

  // Geolocation State
  const [userPos, setUserPos] = useState(null)
  const [geoLocating, setGeoLocating] = useState(false)

  // Measurement State
  const [isMeasuring, setIsMeasuring] = useState(false)
  const [measurePoints, setMeasurePoints] = useState([])

  const layerById = useMemo(() => {
    const map = {}
    for (const l of layerDefs) map[l.id] = l
    return map
  }, [layerDefs])

  // Filter POIs by Radius if active
  const filteredPois = useMemo(() => {
    let list = kategoriAktif === null ? poiList : poiList.filter((p) => p.kategori === kategoriAktif)

    if (radiusFilter?.center && radiusFilter?.radiusMeters) {
      const [rLat, rLng] = radiusFilter.center
      list = list.filter((p) => {
        const [pLat, pLng] = p.koordinat
        const dist = calcDistance(rLat, rLng, pLat, pLng)
        return dist <= radiusFilter.radiusMeters
      })
    }
    return list
  }, [poiList, kategoriAktif, radiusFilter])

  useImperativeHandle(ref, () => ({
    flyToPoi(poiId) {
      const poi = poiList.find((p) => p.id === poiId)
      if (!poi || !mapRef.current) return
      const map = mapRef.current
      map.flyTo(poi.koordinat, 17, { duration: 0.8 })
      const onMoveEnd = () => {
        map.off('moveend', onMoveEnd)
        markerRefs.current[poiId]?.openPopup()
      }
      map.on('moveend', onMoveEnd)
    },
    flyToCoords(coords, zoom = 17) {
      if (!coords || !mapRef.current) return
      mapRef.current.flyTo(coords, zoom, { duration: 0.8 })
    },
    resetView() {
      mapRef.current?.fitBounds(MAP_CONFIG.bounds)
    },
    invalidateSize() {
      mapRef.current?.invalidateSize()
    },
    zoomIn() {
      mapRef.current?.zoomIn()
    },
    zoomOut() {
      mapRef.current?.zoomOut()
    },
  }))

  useEffect(() => {
    if (location.state?.coords && mapRef.current) {
      mapRef.current.flyTo(location.state.coords, 17, { duration: 0.8 })
    } else if (location.state?.type === 'desa' && mapRef.current) {
      mapRef.current.fitBounds(MAP_CONFIG.bounds)
    }
  }, [location.state])

  // Geolocation Handler
  function handleLocateUser() {
    if (!navigator.geolocation) {
      alert('Browser Anda tidak mendukung fitur Geolocation GPS.')
      return
    }
    setGeoLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLocating(false)
        const coords = [pos.coords.latitude, pos.coords.longitude]
        setUserPos({ coords, accuracy: pos.coords.accuracy })
        mapRef.current?.flyTo(coords, 17, { duration: 1 })
      },
      (err) => {
        setGeoLocating(false)
        let pesan = 'Gagal mengakses GPS.'
        if (err.code === 1) {
          pesan = 'Izin akses lokasi ditolak oleh browser/perangkat. Silakan aktifkan izin lokasi di pengaturan browser Anda.'
        } else if (err.code === 2) {
          pesan = 'Posisi lokasi tidak dapat ditentukan oleh perangkat.'
        } else if (err.code === 3) {
          pesan = 'Waktu permintaan lokasi GPS habis (timeout).'
        }
        alert(pesan)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  // Handle map click for measure or radius center
  function handleMapClick(latlng) {
    if (isMeasuring) {
      setMeasurePoints((prev) => [...prev, [latlng.lat, latlng.lng]])
    } else if (onSetRadiusCenter) {
      onSetRadiusCenter([latlng.lat, latlng.lng])
    }
  }

  // Measure total distance
  const totalMeasureDistance = useMemo(() => {
    if (measurePoints.length < 2) return 0
    let total = 0
    for (let i = 0; i < measurePoints.length - 1; i++) {
      total += calcDistance(
        measurePoints[i][0],
        measurePoints[i][1],
        measurePoints[i + 1][0],
        measurePoints[i + 1][1]
      )
    }
    return total
  }, [measurePoints])

  return (
    <div className="mapwrap" style={{ height }}>
      <MapContainer
        ref={mapRef}
        center={MAP_CONFIG.center}
        zoom={MAP_CONFIG.zoom}
        minZoom={MAP_CONFIG.minZoom}
        maxZoom={MAP_CONFIG.maxZoom}
        className="mapwrap__map"
        zoomControl={false}
        scrollWheelZoom
        preferCanvas
      >
        <BasemapTileLayer basemapId={selectedBasemap} />

        <MapEventsHandler
          isMeasuring={isMeasuring}
          isSettingRadiusCenter={Boolean(onSetRadiusCenter)}
          onMapClick={handleMapClick}
        />

        {/* LAYER GEOJSON (Hanya untuk Polygon dan Line, Point dirender lewat Marker POI) */}
        {activeLayers.map((id) => {
          const layerDef = layerById[id]
          if (!layerDef || layerDef.type === 'point' || layerDef.manajemen === 'poi') return null
          const opacity = layerOpacities[id] !== undefined ? layerOpacities[id] : 1
          return (
            <LayerGeoJson
              key={layerDef.id}
              layerDef={layerDef}
              data={layerData[layerDef.id]}
              opacity={opacity}
            />
          )
        })}

        {/* RADIUS FILTER CIRCLE & CENTER */}
        {radiusFilter?.center && (
          <>
            <Circle
              center={radiusFilter.center}
              radius={radiusFilter.radiusMeters}
              pathOptions={{ color: '#0ea5e9', fillColor: '#0ea5e9', fillOpacity: 0.12, weight: 2, dashArray: '4, 4' }}
            />
            <Circle
              center={radiusFilter.center}
              radius={10}
              pathOptions={{ color: '#0ea5e9', fillColor: '#0ea5e9', fillOpacity: 0.8 }}
            />
          </>
        )}

        {/* USER GPS LOCATION MARKER */}
        {userPos && (
          <>
            <Circle
              center={userPos.coords}
              radius={userPos.accuracy}
              pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.15, weight: 1 }}
            />
            <Circle
              center={userPos.coords}
              radius={12}
              pathOptions={{ color: '#ffffff', fillColor: '#2563eb', fillOpacity: 1, weight: 3 }}
            />
          </>
        )}

        {/* POI MARKERS */}
        {filteredPois.map((poi) => (
          <Marker
            key={poi.id}
            position={poi.koordinat}
            icon={buatIkonMarker(poi.layerWarna || '#0891b2')}
            ref={(el) => {
              markerRefs.current[poi.id] = el
            }}
            eventHandlers={{ click: () => onSelectPoi?.(poi.id) }}
          >
            <Popup maxWidth={300} minWidth={220}>
              <div
                className="mapwrap__popup"
                style={{ '--accent': poi.layerWarna || '#292524' }}
              >
                <div className="mapwrap__popup-media">
                  <img
                    src={poi.foto?.[0]}
                    alt={poi.nama}
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                </div>
                <div className="mapwrap__popup-body">
                  <span className="mapwrap__popup-badge">
                    <span className="mapwrap__popup-dot" />
                    {poi.layerNama}
                    {poi.kategoriFitur && ` · ${poi.kategoriFitur}`}
                  </span>
                  <strong className="mapwrap__popup-title">{poi.nama}</strong>
                  <p className="mapwrap__popup-desc">{poi.deskripsi}</p>
                  <div className="mapwrap__popup-footer">
                    <span className="mapwrap__popup-loc">
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" aria-hidden="true">
                        <path d="M12 21s-6-5.5-6-10a6 6 0 1 1 12 0c0 4.5-6 10-6 10Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                        <circle cx="12" cy="11" r="2.2" stroke="currentColor" strokeWidth="1.8" />
                      </svg>
                      {SITE.desa}
                    </span>
                    <button
                      type="button"
                      className="mapwrap__popup-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/lokasi/${poi.id}`)
                      }}
                    >
                      Detail
                    </button>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* MEASURE POLYLINE / POLYGON */}
        {measurePoints.length > 0 && (
          <>
            <Polyline positions={measurePoints} pathOptions={{ color: '#ef4444', weight: 3, dashArray: '6, 6' }} />
            {measurePoints.map((pt, idx) => (
              <Circle key={idx} center={pt} radius={5} pathOptions={{ color: '#ef4444', fillColor: '#ffffff', fillOpacity: 1, weight: 2 }} />
            ))}
          </>
        )}
      </MapContainer>

      {/* MEASUREMENT TOOL FLOATING PANEL */}
      {isMeasuring && (
        <div className="mapwrap__measure-panel">
          <div style={{ fontWeight: 600, fontSize: '0.84rem' }}>Pengukur Jarak</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--admin-muted)', margin: '0.2rem 0 0.5rem' }}>
            Klik pada peta untuk menambah titik ukur ({measurePoints.length} titik)
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ef4444' }}>
            {totalMeasureDistance >= 1000 ? `${(totalMeasureDistance / 1000).toFixed(2)} km` : `${totalMeasureDistance} m`}
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.6rem' }}>
            <button
              type="button"
              className="mapwrap__tool-btn"
              onClick={() => setMeasurePoints([])}
              disabled={measurePoints.length === 0}
            >
              Reset
            </button>
            <button
              type="button"
              className="mapwrap__tool-btn mapwrap__tool-btn--active"
              onClick={() => { setIsMeasuring(false); setMeasurePoints([]); }}
            >
              Selesai
            </button>
          </div>
        </div>
      )}

      {/* MAP CONTROLS FLOATING BAR */}
      <div className="mapwrap__controls">
        {/* BASEMAP SWITCHER BUTTON */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className={`mapwrap__btn ${basemapOpen ? 'mapwrap__btn--on' : ''}`}
            onClick={() => setBasemapOpen((v) => !v)}
            aria-label="Pilih Basemap"
            title="Pilihan Peta Dasar"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
            </svg>
          </button>

          {basemapOpen && (
            <div className="mapwrap__basemap-dropdown">
              <span className="mapwrap__dropdown-title">Pilihan Peta Dasar</span>
              {BASEMAPS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  className={`mapwrap__basemap-opt ${selectedBasemap === b.id ? 'mapwrap__basemap-opt--on' : ''}`}
                  onClick={() => { setSelectedBasemap(b.id); setBasemapOpen(false); }}
                >
                  <span className="mapwrap__basemap-dot" />
                  <span>{b.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* GPS LOCATION BUTTON */}
        <button
          type="button"
          onClick={handleLocateUser}
          className={`mapwrap__btn ${userPos ? 'mapwrap__btn--on' : ''}`}
          aria-label="Lokasi Saya (GPS)"
          title="Lokasi Saya (GPS)"
          disabled={geoLocating}
        >
          <svg
            viewBox="0 0 24 24"
            width="18" height="18"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className={geoLocating ? 'dash__spin' : ''}
          >
            <circle cx="12" cy="12" r="8" strokeDasharray="3, 3" />
            <circle cx="12" cy="12" r="3" />
            <line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" />
            <line x1="2" x2="6" y1="12" y2="12" /><line x1="18" x2="22" y1="12" y2="12" />
          </svg>
        </button>

        {/* MEASURE TOOL BUTTON */}
        <button
          type="button"
          onClick={() => { setIsMeasuring((v) => !v); setMeasurePoints([]); }}
          className={`mapwrap__btn ${isMeasuring ? 'mapwrap__btn--on' : ''}`}
          aria-label="Ukur Jarak"
          title="Ukur Jarak Spasial"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0l12.6 12.6z" />
            <line x1="14.5" x2="16.5" y1="12.5" y2="14.5" /><line x1="11.5" x2="13.5" y1="9.5" y2="11.5" />
            <line x1="8.5" x2="10.5" y1="6.5" y2="8.5" />
          </svg>
        </button>

        <button type="button" className="mapwrap__btn" onClick={() => mapRef.current?.zoomIn()} aria-label="Perbesar">+</button>
        <button type="button" className="mapwrap__btn" onClick={() => mapRef.current?.zoomOut()} aria-label="Perkecil">−</button>
        <button
          type="button"
          className="mapwrap__btn"
          onClick={() => mapRef.current?.fitBounds(MAP_CONFIG.bounds)}
          aria-label="Tampilan awal"
          title="Tampilan awal"
        >
          ⟲
        </button>
      </div>
    </div>
  )
}
