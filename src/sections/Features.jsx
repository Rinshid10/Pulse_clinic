import { motion } from 'framer-motion'
import { Activity } from 'lucide-react'
import { Reveal, stagger, staggerItem } from '../components/Reveal'
import { FEATURES } from '../data/clinic'
import { ICONS } from '../lib/icons'

export default function Features() {
  return (
    <section className="section" style={{ background: 'var(--bg-soft)' }}>
      <div className="wrap">
        <div className="feat">
          <div>
            <Reveal className="section__head" style={{ textAlign: 'left', margin: '0 0 32px', maxWidth: 480 }}>
              <span className="eyebrow">Why Pulse</span>
              <h2>Healthcare that puts <span className="gradient-text">you first</span></h2>
              <p>We combine medical excellence with a seamless digital experience, so you can focus on what matters — feeling better.</p>
            </Reveal>

            <motion.div className="feat__list" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
              {FEATURES.map((f) => {
                const Icon = ICONS[f.icon]
                return (
                  <motion.div className="feat__item" key={f.title} variants={staggerItem}>
                    <div className="feat__ico"><Icon size={22} /></div>
                    <div>
                      <h3>{f.title}</h3>
                      <p>{f.desc}</p>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>

          <Reveal className="feat__art" delay={0.1}>
            {[260, 360, 460].map((d, i) => (
              <motion.span
                key={d}
                className="ring"
                style={{ width: d, height: d }}
                animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.2, 0.5] }}
                transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
              />
            ))}
            <motion.div
              className="feat__pulse"
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Activity size={64} strokeWidth={2} />
            </motion.div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
