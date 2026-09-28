import { NavLink } from 'react-router-dom'
import { Wallet, ExternalLink } from 'lucide-react'
import { BILLING_NAV } from '../utils/constants'
import { useAuth } from '../hooks/useAuth'

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth()
  const role = user?.role || 'cashier'
  const items = BILLING_NAV.filter((n) => n.roles.includes(role))

  return (
    <>
      {open && <div className="ad-side-scrim" onClick={onClose} />}
      <aside className={`ad-sidebar ${open ? 'open' : ''}`}>
        <div className="ad-brand">
          <div className="ad-brand__mark">
            <Wallet size={22} strokeWidth={2.6} />
          </div>
          <div>
            <div className="ad-brand__name">Pulse Billing</div>
            <div className="ad-brand__sub">Billing &amp; pharmacy desk</div>
          </div>
        </div>

        <nav className="ad-nav">
          <div className="ad-nav__label">Desk</div>
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
          <p>Doctors, appointments and website settings live in the admin console.</p>
          <a className="ad-btn ad-btn--sm" href="/admin" target="_blank" rel="noreferrer" style={{ background: 'rgba(255,255,255,.18)', color: '#fff', width: '100%' }}>
            Open Admin
          </a>
        </div>
      </aside>
    </>
  )
}
