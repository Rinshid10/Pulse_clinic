import { Home, Stethoscope, CalendarCheck, CalendarPlus } from 'lucide-react'

/* Customer website: phone bottom bar (hidden on desktop by CSS). */
export default function MobileTabBar({ view, go, onBook, bookingsCount = 0 }) {
  const tabs = [
    { key: 'home', label: 'Home', Icon: Home },
    { key: 'doctors', label: 'Doctors', Icon: Stethoscope },
    { key: 'bookings', label: 'Bookings', Icon: CalendarCheck, badge: bookingsCount },
  ]
  return (
    <nav className="mtab" aria-label="Main">
      {tabs.map(({ key, label, Icon, badge }) => (
        <button key={key} type="button" className={`mtab__item ${view === key ? 'active' : ''}`} onClick={() => go(key)}>
          <span className="mtab__icon"><Icon size={22} />{badge > 0 && <i className="mtab__badge">{badge}</i>}</span>
          <span>{label}</span>
        </button>
      ))}
      <button type="button" className="mtab__item mtab__item--cta" onClick={onBook}>
        <span className="mtab__icon mtab__icon--cta"><CalendarPlus size={22} /></span>
        <span>Book</span>
      </button>
    </nav>
  )
}
