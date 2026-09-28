import { useNavigate } from 'react-router-dom'
import { Moon, Sun, Menu, LogOut, CalendarClock } from 'lucide-react'
import { Avatar } from '../../admin/components/ui'
import { useAuth } from '../hooks/useAuth'
import { ROLE_LABEL } from '../services/authService'
import { fmtDate } from '../../admin/utils/format'
import { TODAY } from '../../services/staffStore'

export default function Topbar({ title, subtitle, theme, toggleTheme, onMenu }) {
  const { user, me, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="ad-topbar">
      <button className="ad-iconbtn ad-menu-btn" onClick={onMenu} aria-label="Menu">
        <Menu size={19} />
      </button>
      <div className="ad-topbar__title">
        <b>{title}</b>
        {subtitle && <span>{subtitle}</span>}
      </div>

      <span className="ad-tag st-today"><CalendarClock size={14} /> {fmtDate(TODAY)}</span>

      <button className="ad-iconbtn" onClick={toggleTheme} aria-label="Theme">
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <button className="ad-user" onClick={() => navigate('/staff/profile')} style={{ background: 'none', border: 'none', padding: 0 }}>
        <Avatar name={user?.name || 'Staff'} color={user?.color || '#10c8a3'} size="sm" />
        <div className="ad-user__meta">
          <b>{user?.name}</b>
          <span>{me?.designation || ROLE_LABEL[user?.role] || 'Staff'}</span>
        </div>
      </button>
      <button className="ad-iconbtn" onClick={() => { logout(); navigate('/staff/login') }} title="Log out" aria-label="Log out">
        <LogOut size={18} />
      </button>
    </header>
  )
}
