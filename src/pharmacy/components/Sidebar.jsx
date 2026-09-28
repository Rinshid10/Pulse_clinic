import { NavLink } from 'react-router-dom'
import { Pill, ExternalLink } from 'lucide-react'
import { PHARMACY_NAV } from '../utils/constants'
import { useAuth } from '../hooks/useAuth'

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth()
  const role = user?.role || 'cashier'
  const items = PHARMACY_NAV.filter((n) => n.roles.includes(role))

  return (
    <>
      {open && <div className="ad-side-scrim" onClick={onClose} />}
      <aside className={`ad-sidebar ${open ? 'open' : ''}`}>
        <div className="ad-brand">
          <div className="ad-brand__mark">
            <Pill size={22} strokeWidth={2.6} />
          </div>
          <div>
            <div className="ad-brand__name">Pulse Pharmacy</div>
            <div className="ad-brand__sub">Pharmacy desk</div>
          </div>
        </div>

        <nav className="ad-nav">
          <div className="ad-nav__label">Pharmacy</div>
          {items.map(({ to, label, Icon, end }) => (
            <NavLink key={to} to={to} end={end} className="ad-navlink" onClick={onClose}>
              <Icon />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="ad-side-card">
          <ExternalLink size={18} />
          <b style={{ display: 'block', marginTop: 8 }}>Other consoles</b>
          <p>Consultation bills live in the billing desk; stock approvals in the admin console.</p>
          <a className="ad-btn ad-btn--sm" href="/billing" target="_blank" rel="noreferrer" style={{ background: 'rgba(255,255,255,.18)', color: '#fff', width: '100%' }}>
            Open billing desk
          </a>
        </div>
      </aside>
    </>
  )
}
