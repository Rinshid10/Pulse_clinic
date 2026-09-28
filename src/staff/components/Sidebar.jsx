import { NavLink } from 'react-router-dom'
import { HeartPulse, LifeBuoy } from 'lucide-react'
import { STAFF_NAV } from '../utils/constants'
import { useAuth } from '../hooks/useAuth'

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth()
  const role = user?.role || 'staff'
  const items = STAFF_NAV.filter((n) => n.roles.includes(role))
  const groups = [...new Set(items.map((n) => n.group))]

  return (
    <>
      {open && <div className="ad-side-scrim" onClick={onClose} />}
      <aside className={`ad-sidebar ${open ? 'open' : ''}`}>
        <div className="ad-brand">
          <div className="ad-brand__mark">
            <HeartPulse size={22} strokeWidth={2.6} />
          </div>
          <div>
            <div className="ad-brand__name">Pulse Staff</div>
            <div className="ad-brand__sub">Employee portal</div>
          </div>
        </div>

        <nav className="ad-nav">
          {groups.map((g) => (
            <div key={g}>
              <div className="ad-nav__label">{g}</div>
              {items.filter((n) => n.group === g).map(({ to, label, Icon, end }) => (
                <NavLink key={to} to={to} end={end} className="ad-navlink" onClick={onClose}>
                  <Icon />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="ad-side-card">
          <LifeBuoy size={18} />
          <b style={{ display: 'block', marginTop: 8 }}>Need help?</b>
          <p>Raise a concern and HR will get back to you within 2 working days. Managers and HR sign in at <b>/hr</b>.</p>
          <NavLink to="/staff/concerns" className="ad-btn ad-btn--sm" onClick={onClose} style={{ background: 'rgba(255,255,255,.18)', color: '#fff', width: '100%' }}>
            Raise a concern
          </NavLink>
        </div>
      </aside>
    </>
  )
}
