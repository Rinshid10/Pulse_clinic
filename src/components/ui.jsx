import { useEffect, useRef, useState } from 'react'
import { useInView, animate } from 'framer-motion'
import { initials, shade } from '../lib/utils'

const SIZES = { sm: 34, md: 44, lg: 56, xl: 64 }

export function Avatar({ name, color = '#5b6b8c', size = 'md', style }) {
  const px = SIZES[size] || size
  return (
    <div
      className="avatar"
      style={{
        width: px,
        height: px,
        fontSize: px * 0.38,
        background: `linear-gradient(135deg, ${color}, ${shade(color)})`,
        ...style,
      }}
    >
      {initials(name)}
    </div>
  )
}

export function Badge({ kind = 'gray', solid, children }) {
  return <span className={`badge badge--${kind} ${solid ? 'badge--solid' : ''}`}>{children}</span>
}

/* Animated count-up number, triggers when scrolled into view */
export function CountUp({ to, suffix = '', duration = 1.6 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const [val, setVal] = useState(0)

  useEffect(() => {
    if (!inView) return
    const controls = animate(0, to, {
      duration,
      ease: [0.22, 0.8, 0.2, 1],
      onUpdate: (v) => setVal(Math.round(v)),
    })
    return () => controls.stop()
  }, [inView, to, duration])

  return (
    <span ref={ref}>
      {val}
      {suffix}
    </span>
  )
}
