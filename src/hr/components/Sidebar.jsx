import { NavLink } from 'react-router-dom'
import { UsersRound, ExternalLink } from 'lucide-react'
import { HR_NAV } from '../utils/constants'
import { useAuth } from '../hooks/useAuth'
import { useStore } from '../../admin/hooks/useStore'
import { pendingCounts } from '../../services/staffStore'

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth()
  const [pending] = useStore(() => pendingCounts(), [])
  const role = user?.role || 'manager'
  const items = HR_NAV.filter((n) => n.roles.includes(role))
  const groups = [...new Set(items.map((n) => n.group))]
  const approvals = pending.leave + pending.shifts + pending.overtime

  return (
    <>
      {open && <div className="ad-side-scrim" onClick={onClose} />}
      <aside className={`ad-sidebar ${open ? 'open' : ''}`}>
        <div className="ad-brand">
          <div className="ad-brand__mark">
            <UsersRound size={22} strokeWidth={2.6} />
          </div>
          <div>
            <div className="ad-brand__name">Pulse HR</div>
            <div className="ad-brand__sub">People management</div>
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
                  {to === '/hr/approvals' && approvals > 0 && <span className="ad-navlink__badge">{approvals}</span>}
                  {to === '/hr/concerns' && pending.concerns > 0 && <span className="ad-navlink__badge">{pending.concerns}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="ad-side-card">
          <ExternalLink size={18} />
          <b style={{ display: 'block', marginTop: 8 }}>Staff portal</b>
          <p>Employees apply for leave, log overtime and raise concerns at /staff.</p>
          <a className="ad-btn ad-btn--sm" href="/staff" target="_blank" rel="noreferrer" style={{ background: 'rgba(255,255,255,.18)', color: '#fff', width: '100%' }}>
            Open staff portal
          </a>
        </div>
      </aside>
    </>
  )
}
