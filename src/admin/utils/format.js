export const initials = (name = '') =>
  name.replace(/^Dr\.\s*/, '').split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()

export const money = (n) => `$${Number(n || 0).toLocaleString()}`

export const fmtDate = (iso) => {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export const relDay = (iso) => {
  if (iso === '2026-06-29') return 'Today'
  if (iso === '2026-06-30') return 'Tomorrow'
  if (iso === '2026-07-01') return 'Wed, Jul 1'
  return fmtDate(iso)
}

export const to12h = (t) => {
  if (!t) return '—'
  let [h, m] = t.split(':').map(Number)
  const ap = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${h}:${String(m).padStart(2, '0')} ${ap}`
}

export function shade(hex, amt = 26) {
  if (!hex?.startsWith('#')) return hex
  const n = parseInt(hex.slice(1), 16)
  const c = (v) => Math.max(0, Math.min(255, v))
  const r = c((n >> 16) - amt)
  const g = c(((n >> 8) & 255) - amt)
  const b = c((n & 255) - amt)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}
