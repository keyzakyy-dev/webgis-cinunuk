import { KATEGORI } from '../data/siteConfig'
import './PoiList.css'

export default function PoiList({ poiList, selectedId, onSelect }) {
  return (
    <div className="poilist">
      <div className="poilist__head">
        <h4 className="poilist__title">Daftar Lokasi</h4>
        <span className="poilist__count">{poiList.length}</span>
      </div>
      <ul className="poilist__items">
        {poiList.map((poi) => {
          const kat = KATEGORI[poi.kategori]
          const isActive = selectedId === poi.id
          return (
            <li key={poi.id}>
              <button
                type="button"
                className={'poilist__item' + (isActive ? ' poilist__item--active' : '')}
                onClick={() => onSelect(poi.id)}
              >
                <span
                  className="poilist__dot"
                  style={{ background: kat?.warna }}
                />
                <div className="poilist__info">
                  <strong>{poi.nama}</strong>
                  <span>{kat?.label}</span>
                </div>
                <svg
                  className="poilist__arrow"
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="m9 6 6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
