import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { MAP_CONFIG } from '../data/siteConfig'
import './MiniMap.css'

export default function MiniMap({ geoJsonData }) {
  return (
    <div className="minimap">
      <MapContainer
        center={MAP_CONFIG.center}
        zoom={14}
        minZoom={MAP_CONFIG.minZoom}
        maxZoom={MAP_CONFIG.maxZoom}
        className="minimap__map"
        zoomControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {geoJsonData && (
          <GeoJSON
            data={geoJsonData}
            style={{
              color: '#292524',
              weight: 2,
              fillColor: '#292524',
              fillOpacity: 0.08,
            }}
          />
        )}
      </MapContainer>
    </div>
  )
}
