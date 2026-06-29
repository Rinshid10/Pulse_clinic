import { initials, shade } from '../utils/format'

const SIZES = { sm: 32, md: 40, lg: 52, xl: 64 }

export function Avatar({ name, color = '#5b6b8c', size = 'md', style }) {
  const px = SIZES[size] || size
  return (
    <div
      className="ad-avatar"
      style={{ width: px, height: px, fontSize: px * 0.38, background: `linear-gradient(135deg, ${color}, ${shade(color)})`, ...style }}
    >
      {initials(name)}
    </div>
  )
}

export function Badge({ kind = 'gray', children }) {
  return <span className={`ad-badge ad-badge--${kind}`}>{children}</span>
}

export function Button({ variant = 'primary', sm, block, children, ...rest }) {
  return (
    <button className={`ad-btn ad-btn--${variant} ${sm ? 'ad-btn--sm' : ''} ${block ? 'ad-btn--block' : ''}`} {...rest}>
      {children}
    </button>
  )
}

export function EmptyState({ icon: Icon, title, children }) {
  return (
    <div className="ad-empty">
      {Icon && <Icon />}
      <p>{title}</p>
      {children}
    </div>
  )
}

export function Spinner() {
  return (
    <div style={{ display: 'grid', placeItems: 'center', padding: 60 }}>
      <div className="ad-spinner" />
    </div>
  )
}
