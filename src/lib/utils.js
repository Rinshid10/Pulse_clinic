import { getDoctors } from '../services/clinicStore'

export const docById = (id) => getDoctors().find((d) => d.id === id)

export const initials = (name) =>
  name
    .replace(/^Dr\.\s*/, '')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

const clamp = (v) => Math.max(0, Math.min(255, v))

// Positive amt darkens, negative amt lightens.
export function shade(hex, amt = 26) {
  const n = parseInt(hex.slice(1), 16)
  const r = clamp((n >> 16) - amt)
  const g = clamp(((n >> 8) & 255) - amt)
  const b = clamp((n & 255) - amt)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

export const fmtDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export const relDay = (iso) => {
  if (iso === '2026-06-29') return 'Today'
  if (iso === '2026-06-30') return 'Tomorrow'
  return fmtDate(iso)
}

export const to12h = (t) => {
  let [h, m] = t.split(':').map(Number)
  const ap = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${h}:${String(m).padStart(2, '0')} ${ap}`
}
