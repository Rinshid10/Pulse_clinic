import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import DoctorModal from './components/DoctorModal'
import BookingModal from './components/BookingModal'
import Home from './pages/Home'
import DoctorsPage from './pages/DoctorsPage'
import MyBookings from './pages/MyBookings'
import { ToastProvider, useToast } from './hooks/useToast'
import { applyCustomerTheme, getThemeMode, setThemeMode, subscribe } from './services/clinicStore'

let bookingSeq = 0

function Shell() {
  const [view, setView] = useState('home')
  const [theme, setTheme] = useState(() => getThemeMode())
  const [activeDoctor, setActiveDoctor] = useState(null)
  const [booking, setBooking] = useState({ open: false, preset: null })
  const [bookings, setBookings] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pulse-bookings')) || [] } catch { return [] }
  })
  const toast = useToast()

  // Apply the admin-controlled color theme on load + whenever it changes.
  useEffect(() => {
    applyCustomerTheme()
    return subscribe((key) => {
      if (!key || key === 'pulse-theme-colors') applyCustomerTheme()
      if (!key || key === 'pulse-theme') setTheme(getThemeMode())
    })
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    setThemeMode(theme)
    applyCustomerTheme()
  }, [theme])

  useEffect(() => {
    localStorage.setItem('pulse-bookings', JSON.stringify(bookings))
  }, [bookings])

  const addBooking = (record) => {
    setBookings((prev) => [{ id: `bk-${Date.now()}-${++bookingSeq}`, status: 'Booked', ...record }, ...prev])
  }

  const cancelBooking = (id) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: 'Cancelled' } : b)))
    toast('Appointment cancelled', 'Your booking has been cancelled', 'info')
  }

  const go = (v) => {
    setView(v)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }

  const openBooking = (doctor = null, time = null) => {
    setActiveDoctor(null)
    setBooking({ open: true, preset: doctor ? { doctor, time } : null })
  }

  return (
    <>
      <Navbar
        view={view}
        go={go}
        theme={theme}
        toggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        onBook={() => openBooking()}
        bookingsCount={bookings.filter((b) => b.status !== 'Cancelled').length}
        onBookings={() => go('bookings')}
      />

      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 0.8, 0.2, 1] }}
          >
            {view === 'home' && <Home go={go} onBook={openBooking} onOpen={setActiveDoctor} />}
            {view === 'doctors' && <DoctorsPage onOpen={setActiveDoctor} onBook={openBooking} />}
            {view === 'bookings' && (
              <MyBookings bookings={bookings} onBook={openBooking} onCancel={cancelBooking} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer go={go} onBook={() => openBooking()} />

      <DoctorModal
        doctor={activeDoctor}
        onClose={() => setActiveDoctor(null)}
        onBook={(doc, time) => openBooking(doc, time)}
      />
      <BookingModal
        open={booking.open}
        preset={booking.preset}
        onConfirm={addBooking}
        onViewBookings={() => { setBooking({ open: false, preset: null }); go('bookings') }}
        onClose={() => setBooking({ open: false, preset: null })}
      />
    </>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <Shell />
    </ToastProvider>
  )
}
