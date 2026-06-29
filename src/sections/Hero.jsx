import { motion } from 'framer-motion'
import { CalendarPlus, ArrowRight, Star, ShieldCheck, Activity } from 'lucide-react'
import { Avatar } from '../components/ui'
import { useDoctors, useContent } from '../hooks/useClinic'

const ease = [0.22, 0.8, 0.2, 1]

export default function Hero({ onBook, go }) {
  const DOCTORS = useDoctors()
  const content = useContent()
  const featured = DOCTORS[0] || { name: 'Dr. Sarah Chen', title: 'Senior Cardiologist' }

  return (
    <section className="hero" id="home">
      <span className="blob blob--1" />
      <span className="blob blob--2" />
      <div className="wrap">
        <div className="hero__grid">
          {/* Copy */}
          <div>
            <motion.span className="eyebrow" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
              <ShieldCheck size={15} /> Trusted by 38,000+ patients
            </motion.span>

            <motion.h1 initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.08, ease }}>
              {content.heroTitleA}<br /> <span className="gradient-text">{content.heroTitleB}</span>
            </motion.h1>

            <motion.p className="hero__sub" initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.16, ease }}>
              {content.heroSub}
            </motion.p>

            <motion.div className="hero__cta" initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.24, ease }}>
              <button className="btn btn--primary btn--lg" onClick={onBook}>
                <CalendarPlus size={18} /> Book appointment
              </button>
              <button className="btn btn--ghost btn--lg" onClick={() => go('doctors')}>
                Meet our doctors <ArrowRight size={18} />
              </button>
            </motion.div>

            <motion.div className="hero__trust" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.36, ease }}>
              <div className="avatars">
                {DOCTORS.slice(0, 4).map((d) => (
                  <Avatar key={d.id} name={d.name} color={d.color} size="md" />
                ))}
              </div>
              <small>
                <b>4.9/5</b> <Star size={13} fill="#f59e0b" stroke="#f59e0b" style={{ verticalAlign: -2 }} /> from 12,000+ reviews
              </small>
            </motion.div>
          </div>

          {/* Visual */}
          <motion.div
            className="hero__visual"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease }}
          >
            <div className="hero__card">
              <div className="hero__doc">
                <Avatar name={featured.name} color="#ffffff" size="xl" style={{ background: 'rgba(255,255,255,.25)' }} />
                <div className="hero__doc-name">
                  <b>{featured.name}</b>
                  <br />
                  <span>{featured.title}</span>
                </div>
              </div>
              <div className="hero__slots">
                {[
                  { t: 'Today', s: '09:00 AM', open: true },
                  { t: 'Today', s: '11:30 AM', open: true },
                  { t: 'Tomorrow', s: '02:15 PM', open: false },
                ].map((row, i) => (
                  <motion.div
                    key={i}
                    className="slot"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 + i * 0.12, ease }}
                  >
                    <span>{row.t} · <b>{row.s}</b></span>
                    <span className="slot__pill" style={!row.open ? { background: 'var(--surface-3)', color: 'var(--text-3)' } : undefined}>
                      {row.open ? 'Available' : 'Booked'}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              className="floaty floaty--1"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: [0, -10, 0] }}
              transition={{ opacity: { delay: 0.8, duration: 0.5 }, y: { delay: 1, duration: 4, repeat: Infinity, ease: 'easeInOut' } }}
            >
              <div className="floaty__icon" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                <Activity size={20} />
              </div>
              <div>
                <b>45+</b>
                <span>Specialists</span>
              </div>
            </motion.div>

            <motion.div
              className="floaty floaty--2"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: [0, 10, 0] }}
              transition={{ opacity: { delay: 1, duration: 0.5 }, y: { delay: 1.2, duration: 4.5, repeat: Infinity, ease: 'easeInOut' } }}
            >
              <div className="floaty__icon" style={{ background: 'var(--brand-soft)', color: 'var(--brand-600)' }}>
                <Star size={20} fill="currentColor" />
              </div>
              <div>
                <b>4.9</b>
                <span>Avg. rating</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
