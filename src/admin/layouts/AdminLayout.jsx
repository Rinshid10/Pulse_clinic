import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import { NAV } from '../utils/constants'
import BottomNav from '../../components/BottomNav'
import { useAuth } from '../hooks/useAuth'

const TITLES = {
  '/admin': { t: 'Dashboard', s: 'Clinic overview for today' },
  '/admin/doctors': { t: 'Doctors', s: 'Manage your medical team' },
  '/admin/availability': { t: 'Availability & Leave', s: 'Working hours, slots & today leave' },
  '/admin/appointments': { t: 'Appointments', s: 'Confirm, reschedule & cancel bookings' },
  '/admin/patients': { t: 'Patients', s: 'Records & visit history' },
  '/admin/staff': { t: 'Staff', s: 'Salary, time in clinic, leave & concerns' },
  '/admin/medicines': { t: 'Medicine stock', s: 'Pharmacy catalog, stock levels & restocking' },
  '/admin/analytics': { t: 'Analytics', s: 'Performance & trends' },
  '/admin/theme': { t: 'Theme', s: 'Control the customer website colors' },
  '/admin/content': { t: 'Website Content', s: 'Edit homepage text & info' },
  '/admin/notifications': { t: 'Notifications', s: 'Alerts & system messages' },
}

export default function AdminLayout() {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const tabs = NAV.filter((n) => !n.roles || n.roles.includes(user?.role)).slice(0, 4)
  const [theme, setTheme] = useState(() => localStorage.getItem('pulse-admin-theme') || 'light')

  useEffect(() => {
    localStorage.setItem('pulse-admin-theme', theme)
  }, [theme])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  const meta = TITLES[pathname] || NAV.find((n) => n.to === pathname) || { t: 'Admin', s: '' }
  const title = meta.t || meta.label

  return (
    <div className="admin" data-admin-theme={theme}>
      <div className="ad-shell">
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
        <div className="ad-main">
          <Topbar
            title={title}
            subtitle={meta.s}
            theme={theme}
            toggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            onMenu={() => setMenuOpen((o) => !o)}
          />
          <main className="ad-content">
            <motion.div key={pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Outlet />
            </motion.div>
          </main>
        </div>
      </div>
      <BottomNav tabs={tabs} menuOpen={menuOpen} onMore={() => setMenuOpen((o) => !o)} />
    </div>
  )
}
