import { NavLink } from 'react-router-dom'
import { Activity, Sparkles } from 'lucide-react'
import { NAV } from '../utils/constants'
import { useAuth } from '../hooks/useAuth'
import { useStore } from '../hooks/useStore'
import { unreadCount } from '../services/notificationService'

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth()
  const [unread] = useStore(() => unreadCount(), [])
  const role = user?.role || 'admin'
  const items = NAV.filter((n) => n.roles.includes(role))

  return (
    <>
      {open && <div className="ad-side-scrim" onClick={onClose} />}
      <aside className={`ad-sidebar ${open ? 'open' : ''}`}>
        <div className="ad-brand">
          <div className="ad-brand__mark">
            <Activity size={22} strokeWidth={2.6} />
          </div>
          <div>
            <div className="ad-brand__name">Pulse Admin</div>
            <div className="ad-brand__sub">Clinic Console</div>
          </div>
        </div>

        <nav className="ad-nav">
          <div className="ad-nav__label">Manage</div>
          {items.map(({ to, label, Icon, end }) => (
            <NavLink key={to} to={to} end={end} className="ad-navlink" onClick={onClose}>
              <Icon />
              <span>{label}</span>
              {to === '/admin/notifications' && unread > 0 && <span className="ad-navlink__badge">{unread}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="ad-side-card">
          <Sparkles size={18} />
          <b style={{ display: 'block', marginTop: 8 }}>Live website control</b>
          <p>Theme &amp; doctor leave changes apply to the customer site instantly.</p>
          <a className="ad-btn ad-btn--sm" href="/" target="_blank" rel="noreferrer" style={{ background: 'rgba(255,255,255,.18)', color: '#fff', width: '100%' }}>
            View website
          </a>
        </div>
      </aside>
    </>
  )
}
