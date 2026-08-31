import './Loading.css'

export default function Loading({ text = 'Memuat data…' }) {
  return (
    <div className="loading" role="status" aria-live="polite">
      <span className="loading__spinner" aria-hidden="true" />
      <span className="loading__text">{text}</span>
    </div>
  )
}
