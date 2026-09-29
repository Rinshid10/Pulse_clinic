import { useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Wallet, Mail, Lock, ArrowRight, Receipt, Pill, BadgeCheck } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../../admin/components/ui'
import { DEMO_USERS } from '../services/authService'
import '../styles/billing.css'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: 'cashier@pulse.com', password: 'admin123' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/billing" replace />

  const submit = (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    login(form)
      .then(() => navigate(location.state?.from?.pathname || '/billing', { replace: true }))
      .catch((err) => { setError(err.message); setLoading(false) })
  }

  const fill = (email) => setForm({ email, password: 'admin123' })

  return (
    <div className="admin billing" data-admin-theme="light">
      <div className="ad-login">
        <div className="ad-login__art">
          <div className="ad-brand" style={{ padding: 0, color: '#fff' }}>
            <div className="ad-brand__mark" style={{ background: 'rgba(255,255,255,.2)' }}>
              <Wallet size={22} strokeWidth={2.6} />
            </div>
            <div>
              <div className="ad-brand__name" style={{ color: '#fff' }}>Pulse Billing</div>
              <div className="ad-brand__sub" style={{ color: 'rgba(255,255,255,.8)' }}>Consultation billing</div>
            </div>
          </div>

          <div>
            <motion.h2 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              Bill every consultation in seconds.
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              Patient name, age and doctor on every bill, an automatic free follow-up within 7 days, and today’s totals for the admin.
            </motion.p>
            <div className="ad-login__feats" style={{ marginTop: 28 }}>
              {[
                { Icon: Receipt, t: 'Consultation bills & daily totals' },
                { Icon: BadgeCheck, t: 'Automatic free follow-up within 7 days' },
                { Icon: Pill, t: 'Patient visit history at a glance' },
              ].map(({ Icon, t }, i) => (
                <motion.div key={t} className="ad-login__feat" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }}>
                  <span><Icon size={18} /></span> {t}
                </motion.div>
              ))}
            </div>
          </div>

          <span style={{ fontSize: 13, opacity: 0.75, position: 'relative' }}>© 2026 Pulse Clinic</span>
        </div>

        <div className="ad-login__form">
          <motion.div className="ad-login__box" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1>Billing desk sign in</h1>
            <p>Sign in to create consultation bills.</p>

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
              <b>Demo accounts</b> (password: admin123)
              <div style={{ display: 'grid', gap: 4, marginTop: 8 }}>
                {DEMO_USERS.map((u) => <button key={u.email} onClick={() => fill(u.email)}>{u.email} — {u.label}</button>)}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
