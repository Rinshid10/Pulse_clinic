import { useNavigate } from 'react-router-dom'
import { Moon, Sun, Menu, LogOut, CalendarClock } from 'lucide-react'
import { Avatar } from '../../admin/components/ui'
import { useAuth } from '../hooks/useAuth'
import { ROLE_LABEL } from '../services/authService'
import { fmtDate } from '../../admin/utils/format'
import { TODAY } from '../../services/staffStore'

export default function Topbar({ title, subtitle, theme, toggleTheme, onMenu }) {
  const { user, logout } = useAuth()
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

      <span className="ad-tag hr-today"><CalendarClock size={14} /> {fmtDate(TODAY)}</span>

      <button className="ad-iconbtn" onClick={toggleTheme} aria-label="Theme">
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="ad-user">
        <Avatar name={user?.name || 'HR'} color={user?.color || '#4f6cf7'} size="sm" />
        <div className="ad-user__meta">
          <b>{user?.name}</b>
          <span>{user?.designation || ROLE_LABEL[user?.role] || 'HR'}</span>
        </div>
      </div>
      <button className="ad-iconbtn" onClick={() => { logout(); navigate('/hr/login') }} title="Log out" aria-label="Log out">
        <LogOut size={18} />
      </button>
    </header>
  )
}
