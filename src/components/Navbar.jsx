import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Moon, Sun, Menu, X, CalendarPlus, CalendarCheck } from 'lucide-react'

const LINKS = [
  { id: 'home', label: 'Home' },
  { id: 'services', label: 'Services', scroll: true },
  { id: 'doctors', label: 'Doctors' },
  { id: 'bookings', label: 'My bookings' },
  { id: 'contact', label: 'Contact', scroll: true },
]

export default function Navbar({ view, go, theme, toggleTheme, onBook, bookingsCount = 0, onBookings }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handle = (l) => {
    setOpen(false)
    if (l.scroll) {
      go('home')
      setTimeout(() => document.getElementById(l.id)?.scrollIntoView({ behavior: 'smooth' }), view === 'home' ? 0 : 120)
    } else {
      go(l.id)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <motion.nav
      className={`nav ${scrolled ? 'scrolled' : ''}`}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 0.8, 0.2, 1] }}
    >
      <div className="wrap nav__inner">
        <div className="brand" onClick={() => handle({ id: 'home' })}>
          <motion.div className="brand__mark" whileHover={{ rotate: -8, scale: 1.06 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Activity size={23} strokeWidth={2.6} />
          </motion.div>
          <span className="brand__name">Pulse<span>.</span></span>
        </div>

        <div className="nav__links">
          {LINKS.map((l) => (
            <button
              key={l.id}
              className={`nav__link ${(!l.scroll && view === l.id) ? 'active' : ''}`}
              onClick={() => handle(l)}
            >
              {l.label}
            </button>
          ))}
        </div>

        <div className="nav__right">
          <button className="icon-btn nav__bookings" onClick={onBookings} aria-label="My bookings" title="My bookings">
            <CalendarCheck size={19} />
            {bookingsCount > 0 && <span className="nav__badge">{bookingsCount}</span>}
          </button>
          <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
          </button>
          <button className="btn btn--primary btn--sm" onClick={onBook}>
            <CalendarPlus size={17} /> <span className="nav__cta-text">Book appointment</span>
          </button>
          <button className="icon-btn nav__burger" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="mmenu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {LINKS.map((l) => (
              <button key={l.id} className={!l.scroll && view === l.id ? 'active' : ''} onClick={() => handle(l)}>
                {l.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
