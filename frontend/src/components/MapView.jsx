import { useEffect, useRef, useImperativeHandle, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { GeoJSON, MapContainer, Marker, Popup, TileLayer, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { KATEGORI, MAP_CONFIG, SITE } from '../data/siteConfig'
import { buatIkonMarker } from './markerIcon'
import './markerIcon.css'
import './MapView.css'

function styleGeoJson(layerDef) {
  return () => {
    const s = { ...layerDef.style }
    delete s.radius
    return s
  }
}

function sanitizeGeometry(geom) {
  if (!geom || typeof geom !== 'object') return null
  // Perbaiki geometry yang terbungkus ganda ({type:'Feature', geometry:{...}})
  if (geom.type === 'Feature' && geom.geometry) return sanitizeGeometry(geom.geometry)
  const valid = ['Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon', 'GeometryCollection']
  if (!valid.includes(geom.type)) return null
  // Validasi Polygon: setiap ring harus >= 4 posisi
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

function LayerGeoJson({ layerDef, data }) {
  if (!data) return null
  const safeData = useMemo(() => sanitizeGeoJson(data), [data])
  const styleFn = styleGeoJson(layerDef)
  const onEachFeature = (feature, layer) => {
    const name = feature?.properties?.Name || layerDef.label
    if (layer.bindTooltip) {
      layer.bindTooltip(name, { sticky: true, direction: 'top', offset: [0, -4] })
    }
  }
  return (
    <GeoJSON
      key={layerDef.id}
      data={safeData}
      style={styleFn}
      onEachFeature={onEachFeature}
    />
  )
}

export default function MapView({
  ref,
  poiList,
  layerData = {},
  activeLayers = [],
  layerDefs = [],
  kategoriAktif,
  onSelectPoi,
  height = '100%',
}) {
  const mapRef = useRef(null)
  const markerRefs = useRef({})
  const location = useLocation()
  const navigate = useNavigate()

  const layerById = useMemo(() => {
    const map = {}
    for (const l of layerDefs) map[l.id] = l
    return map
  }, [layerDefs])

  const visiblePoi =
    kategoriAktif === null
      ? poiList
      : poiList.filter((p) => p.kategori === kategoriAktif)

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
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="mapwrap__tiles"
        />

        {activeLayers.map((id) => {
          const layerDef = layerById[id]
          if (!layerDef || layerDef.type === 'point') return null
          return (
            <LayerGeoJson key={layerDef.id} layerDef={layerDef} data={layerData[layerDef.id]} />
          )
        })}

        {visiblePoi.map((poi) => (
          <Marker
            key={poi.id}
            position={poi.koordinat}
            icon={buatIkonMarker(poi.kategoriColor || poi.kategori)}
            ref={(el) => {
              markerRefs.current[poi.id] = el
            }}
            eventHandlers={{ click: () => onSelectPoi?.(poi.id) }}
          >
            <Popup maxWidth={300} minWidth={220}>
              <div
                className="mapwrap__popup"
                style={{ '--accent': poi.kategoriColor || KATEGORI[poi.kategori]?.warna || '#292524' }}
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
                    {poi.kategoriLabel || KATEGORI[poi.kategori]?.label}
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
      </MapContainer>

      <div className="mapwrap__controls">
        <button type="button" onClick={() => mapRef.current?.zoomIn()} aria-label="Perbesar">
          +
        </button>
        <button type="button" onClick={() => mapRef.current?.zoomOut()} aria-label="Perkecil">
          −
        </button>
        <button
          type="button"
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
