import { LEGENDA } from '../data/siteConfig'
import './Legend.css'

export default function Legend({ title = null }) {
  return (
    <div className="legend">
      {title && <h4 className="legend__title">{title}</h4>}
      <ul className="legend__list">
        {LEGENDA.map((item) => (
          <li key={item.label} className="legend__item">
            <span
              className={'legend__symbol legend__symbol--' + item.tipe}
              style={{ '--c': item.warna }}
            />
            <span className="legend__label">{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
