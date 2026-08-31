import { useEffect, useRef, useImperativeHandle } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { GeoJSON, MapContainer, Marker, Popup, TileLayer, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { KATEGORI, MAP_CONFIG, SITE, LAYERS, LAYER_KATEGORI } from '../data/siteConfig'
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

function LayerGeoJson({ layerDef, data }) {
  if (!data) return null
  const styleFn = styleGeoJson(layerDef)
  const onEachFeature = (feature, layer) => {
    const name = feature?.properties?.Name || layerDef.label
    if (layer.bindTooltip) {
      layer.bindTooltip(name, { sticky: true, direction: 'top', offset: [0, -4] })
    }
  }
  return (
    <GeoJSON
      data={data}
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
  kategoriAktif,
  onSelectPoi,
  height = '100%',
}) {
  const mapRef = useRef(null)
  const markerRefs = useRef({})
  const location = useLocation()
  const navigate = useNavigate()

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
          const layerDef = LAYERS.find((l) => l.id === id)
          if (!layerDef || layerDef.type === 'point') return null
          return (
            <LayerGeoJson key={layerDef.id} layerDef={layerDef} data={layerData[layerDef.id]} />
          )
        })}

        {visiblePoi.map((poi) => (
          <Marker
            key={poi.id}
            position={poi.koordinat}
            icon={buatIkonMarker(poi.kategori)}
            ref={(el) => {
              markerRefs.current[poi.id] = el
            }}
            eventHandlers={{ click: () => onSelectPoi?.(poi.id) }}
          >
            <Popup maxWidth={300} minWidth={220}>
              <div
                className="mapwrap__popup"
                style={{ '--accent': KATEGORI[poi.kategori]?.warna ?? '#292524' }}
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
                    {KATEGORI[poi.kategori]?.label}
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

        {activeLayers.map((id) => {
          const layerDef = LAYERS.find((l) => l.id === id)
          if (!layerDef || layerDef.type !== 'point') return null
          const data = layerData[layerDef.id]
          if (!data) return null
          const points = (data.features || []).filter((f) => f.geometry?.type === 'Point')
          return points.map((f, i) => {
            const lat = f.geometry.coordinates[1]
            const lng = f.geometry.coordinates[0]
            const poiId = `${layerDef.id}-${i}`
            const kategori = LAYER_KATEGORI[layerDef.id] ?? 'umum'
            const nama = f.properties?.Name || layerDef.label
            const deskripsi = f.properties?.description || `Lokasi ${layerDef.label.toLowerCase()} di Desa ${SITE.desa}.`
            return (
              <Marker
                key={poiId}
                position={[lat, lng]}
                icon={buatIkonMarker(kategori)}
              >
                <Tooltip sticky direction="top" offset={[0, -4]}>
                  {nama}
                </Tooltip>
                <Popup maxWidth={300} minWidth={220}>
                  <div className="mapwrap__popup" style={{ '--accent': KATEGORI[kategori]?.warna ?? layerDef.style.color }}>
                    <div className="mapwrap__popup-body">
                      <span className="mapwrap__popup-badge">
                        <span className="mapwrap__popup-dot" />
                        {layerDef.label}
                      </span>
                      <strong className="mapwrap__popup-title">{nama}</strong>
                      {deskripsi && (
                        <p className="mapwrap__popup-desc">{deskripsi}</p>
                      )}
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
                            navigate(`/lokasi/${poiId}`)
                          }}
                        >
                          Detail
                        </button>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          })
        })}
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
