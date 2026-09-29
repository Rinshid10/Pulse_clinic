import { NavLink } from 'react-router-dom'
import { Menu } from 'lucide-react'

/* Phone bottom navigation for the consoles (admin, staff, HR, billing, pharmacy).
   Hidden on desktop by CSS (.ad-tabbar). `tabs` = [{ to, label, Icon, end }];
   "More" opens the sidebar drawer for everything else. */
export default function BottomNav({ tabs, onMore, menuOpen, moreLabel = 'More' }) {
  return (
    <nav className="ad-tabbar" aria-label="Main">
      {tabs.map(({ to, label, short, Icon, end }) => (
        <NavLink key={to} to={to} end={end} className="ad-tab">
          <Icon size={22} />
          <span>{short || label}</span>
        </NavLink>
      ))}
      {onMore && (
        <button type="button" className={`ad-tab ${menuOpen ? 'active' : ''}`} onClick={onMore}>
          <Menu size={22} />
          <span>{moreLabel}</span>
        </button>
      )}
    </nav>
  )
}
