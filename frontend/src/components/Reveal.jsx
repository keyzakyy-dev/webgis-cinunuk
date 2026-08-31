import { createElement, useEffect, useRef } from 'react'
import './Reveal.css'

export default function Reveal({ children, delay = 0, className = '', as = 'div', ...rest }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('reveal--visible')
          obs.disconnect()
        }
      },
      { threshold: 0.12 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return createElement(
    as,
    {
      ref,
      className: 'reveal' + (className ? ' ' + className : ''),
      style: delay ? { transitionDelay: `${delay}ms` } : undefined,
      ...rest,
    },
    children,
  )
}
