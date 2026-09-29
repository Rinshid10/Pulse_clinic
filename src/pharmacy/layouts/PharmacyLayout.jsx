import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import { PHARMACY_NAV, TITLES } from '../utils/constants'
import BottomNav from '../../components/BottomNav'
import { useAuth } from '../hooks/useAuth'

export default function PharmacyLayout() {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const tabs = PHARMACY_NAV.filter((n) => !n.roles || n.roles.includes(user?.role)).slice(0, 4)
  const [theme, setTheme] = useState(() => localStorage.getItem('pulse-pharmacy-theme') || 'light')

  useEffect(() => {
    localStorage.setItem('pulse-pharmacy-theme', theme)
  }, [theme])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  const meta = TITLES[pathname] || PHARMACY_NAV.find((n) => n.to === pathname) || { t: 'Billing', s: '' }
  const title = meta.t || meta.label

  return (
    <div className="admin pharmacy" data-admin-theme={theme}>
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
