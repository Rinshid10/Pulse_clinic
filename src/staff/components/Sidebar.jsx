import { NavLink } from 'react-router-dom'
import { HeartPulse, LifeBuoy } from 'lucide-react'
import { STAFF_NAV } from '../utils/constants'
import { useAuth } from '../hooks/useAuth'
import { useStore } from '../../admin/hooks/useStore'
import { pendingCounts } from '../../services/staffStore'

export default function Sidebar({ open, onClose }) {
  const { user, isManager } = useAuth()
  const [pending] = useStore(() => pendingCounts(), [])
  const role = user?.role || 'staff'
  const items = STAFF_NAV.filter((n) => n.roles.includes(role))
  const groups = [...new Set(items.map((n) => n.group))]
  const approvals = pending.leave + pending.shifts + pending.overtime

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
                  {to === '/staff/approvals' && approvals > 0 && <span className="ad-navlink__badge">{approvals}</span>}
                  {to === '/staff/concerns' && isManager && pending.concerns > 0 && <span className="ad-navlink__badge">{pending.concerns}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="ad-side-card">
          <LifeBuoy size={18} />
          <b style={{ display: 'block', marginTop: 8 }}>Need help?</b>
          <p>Raise a concern and HR will get back to you within 2 working days.</p>
          <NavLink to="/staff/concerns" className="ad-btn ad-btn--sm" onClick={onClose} style={{ background: 'rgba(255,255,255,.18)', color: '#fff', width: '100%' }}>
            Raise a concern
          </NavLink>
        </div>
      </aside>
    </>
  )
}
