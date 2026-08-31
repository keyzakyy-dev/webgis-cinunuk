import { LEGENDA } from '../data/siteConfig'
import './LegendShowcase.css'

export default function LegendShowcase() {
  return (
    <div className="lshow">
      <div className="lshow__head">
        <h3 className="lshow__title">Keterangan Simbol</h3>
        <span className="lshow__hint">Berlaku di seluruh peta desa</span>
      </div>

      <div className="lshow__grid">
        {LEGENDA.map((item) => (
          <div key={item.label} className="lshow__cell" style={{ '--c': item.warna }}>
            <span className={'lshow__symbol lshow__symbol--' + item.tipe} aria-hidden="true" />
            <div className="lshow__text">
              <strong>{item.label}</strong>
              <span>{item.tipe === 'polygon' ? 'Area polygon' : item.tipe === 'line' ? 'Jaringan linear' : 'Titik lokasi'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
