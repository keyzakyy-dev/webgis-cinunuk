import L from 'leaflet'
import { KATEGORI } from '../data/siteConfig'

export function buatIkonMarker(kategori) {
  const warna = KATEGORI[kategori]?.warna ?? '#292524'
  return L.divIcon({
    className: 'poi-marker',
    html: `<svg viewBox="0 0 24 34" width="26" height="36" aria-hidden="true">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 22 12 22s12-13 12-22C24 5.4 18.6 0 12 0Z" fill="${warna}"/>
      <circle cx="12" cy="12" r="5" fill="#fff"/>
    </svg>`,
    iconSize: [26, 36],
    iconAnchor: [13, 34],
    popupAnchor: [0, -32],
  })
}
