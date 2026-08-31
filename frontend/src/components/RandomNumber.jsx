import { useEffect, useRef, useState } from 'react'

const DIGITS = /\d/

function maskOf(value) {
  return Array.from(value)
    .map((ch) => (DIGITS.test(ch) ? Math.floor(Math.random() * 10) : ch))
    .join('')
}

export default function RandomNumber({ value, duration = 1400 }) {
  const ref = useRef(null)
  const [display, setDisplay] = useState(() => maskOf(value))

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(value)
      return
    }

    let raf
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          io.disconnect()
          const chars = Array.from(value)
          const start = performance.now()
          const step = (now) => {
            const t = Math.min((now - start) / duration, 1)
            if (t < 1) {
              const out = chars.map((ch, i) => {
                if (!DIGITS.test(ch)) return ch
                const lock = 0.2 + (i / chars.length) * 0.6
                return t >= lock ? ch : Math.floor(Math.random() * 10)
              })
              setDisplay(out.join(''))
              raf = requestAnimationFrame(step)
            } else {
              setDisplay(value)
            }
          }
          raf = requestAnimationFrame(step)
        })
      },
      { threshold: 0.4 }
    )
    io.observe(el)
    return () => {
      io.disconnect()
      if (raf) cancelAnimationFrame(raf)
    }
  }, [value, duration])

  return <span ref={ref}>{display}</span>
}
