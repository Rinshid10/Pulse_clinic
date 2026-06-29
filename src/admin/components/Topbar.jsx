import { useNavigate } from 'react-router-dom'
import { Search, Bell, Moon, Sun, Menu, LogOut } from 'lucide-react'
import { Avatar } from './ui'
import { useAuth } from '../hooks/useAuth'
import { useStore } from '../hooks/useStore'
import { unreadCount } from '../services/notificationService'
import { ROLE_LABEL } from '../services/authService'

export default function Topbar({ title, subtitle, theme, toggleTheme, onMenu }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [unread] = useStore(() => unreadCount(), [])

  return (
    <header className="ad-topbar">
      <button className="ad-iconbtn ad-menu-btn" onClick={onMenu} aria-label="Menu">
        <Menu size={19} />
      </button>
      <div className="ad-topbar__title">
        <b>{title}</b>
        {subtitle && <span>{subtitle}</span>}
      </div>

      <div className="ad-search">
        <Search size={16} />
        <input placeholder="Search…" />
      </div>

      <button className="ad-iconbtn" onClick={() => navigate('/admin/notifications')} aria-label="Notifications">
        <Bell size={18} />
        {unread > 0 && <span className="ad-dot">{unread}</span>}
      </button>
      <button className="ad-iconbtn" onClick={toggleTheme} aria-label="Theme">
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="ad-user">
        <Avatar name={user?.name || 'Admin'} color={user?.color || '#4f6cf7'} size="sm" />
        <div className="ad-user__meta">
          <b>{user?.name}</b>
          <span>{ROLE_LABEL[user?.role] || 'Admin'}</span>
        </div>
      </div>
      <button className="ad-iconbtn" onClick={logout} title="Log out" aria-label="Log out">
        <LogOut size={18} />
      </button>
    </header>
  )
}
