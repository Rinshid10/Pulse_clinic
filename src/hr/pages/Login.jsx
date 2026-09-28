import { useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { UsersRound, Mail, Lock, ArrowRight, ClipboardCheck, CalendarRange, Banknote } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../../admin/components/ui'
import { DEMO_USERS } from '../services/authService'
import '../styles/hr.css'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: 'hr@pulse.com', password: 'staff123' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/hr" replace />

  const submit = (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setTimeout(() => {
      try {
        login(form)
        navigate(location.state?.from?.pathname || '/hr', { replace: true })
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }, 450)
  }

  return (
    <div className="admin hr" data-admin-theme="light">
      <div className="ad-login">
        <div className="ad-login__art">
          <div className="ad-brand" style={{ padding: 0, color: '#fff' }}>
            <div className="ad-brand__mark" style={{ background: 'rgba(255,255,255,.2)' }}>
              <UsersRound size={22} strokeWidth={2.6} />
            </div>
            <div>
              <div className="ad-brand__name" style={{ color: '#fff' }}>Pulse HR</div>
              <div className="ad-brand__sub" style={{ color: 'rgba(255,255,255,.8)' }}>People management</div>
            </div>
          </div>

          <div>
            <motion.h2 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              Look after the people who look after patients.
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              Employee records, approvals, rosters, attendance, payroll runs, leave policy and announcements — all in one place.
            </motion.p>
            <div className="ad-login__feats" style={{ marginTop: 28 }}>
              {[
                { Icon: ClipboardCheck, t: 'Approve leave, shift changes & overtime' },
                { Icon: CalendarRange, t: 'Build the weekly roster' },
                { Icon: Banknote, t: 'Run payroll & manage leave policy' },
              ].map(({ Icon, t }, i) => (
                <motion.div key={t} className="ad-login__feat" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }}>
                  <span><Icon size={18} /></span> {t}
                </motion.div>
              ))}
            </div>
          </div>

          <span style={{ fontSize: 13, opacity: 0.75, position: 'relative' }}>© 2026 Pulse Clinic · HR &amp; managers only</span>
        </div>

        <div className="ad-login__form">
          <motion.div className="ad-login__box" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1>HR sign in</h1>
            <p>Use your Pulse HR or manager account.</p>

            {error && <div className="ad-login__err">{error}</div>}

            <form onSubmit={submit} style={{ display: 'grid', gap: 14 }}>
              <div className="ad-field">
                <label>Email address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--ad-text-3)' }} />
                  <input style={{ width: '100%', paddingLeft: 36 }} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@pulse.com" />
                </div>
              </div>
              <div className="ad-field">
                <label>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--ad-text-3)' }} />
                  <input style={{ width: '100%', paddingLeft: 36 }} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
                </div>
              </div>
              <Button type="submit" block disabled={loading}>
                {loading ? 'Signing in…' : <>Sign in <ArrowRight size={16} /></>}
              </Button>
            </form>

            <div className="ad-login__demo">
              <b>Demo accounts</b>
              <div style={{ display: 'grid', gap: 4, marginTop: 8 }}>
                {DEMO_USERS.map((u) => <button key={u.email} onClick={() => setForm({ email: u.email, password: u.password })}>{u.email} — {u.label}</button>)}
                <button onClick={() => setForm({ email: 'admin@pulse.com', password: 'admin123' })}>admin@pulse.com — Clinic administrator</button>
              </div>
            </div>
            <p style={{ marginTop: 18, fontSize: 12.5, color: 'var(--ad-text-3)' }}>
              Not HR? <a href="/staff/login" style={{ color: 'var(--ad-brand-600)', fontWeight: 700 }}>Staff portal</a> · <a href="/admin/login" style={{ color: 'var(--ad-brand-600)', fontWeight: 700 }}>Admin</a>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
