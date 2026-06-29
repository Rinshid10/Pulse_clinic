import { motion } from 'framer-motion'
import { Reveal, stagger, staggerItem } from '../components/Reveal'
import { STEPS } from '../data/clinic'
import { ICONS } from '../lib/icons'

export default function HowItWorks() {
  return (
    <section className="section" id="how">
      <div className="wrap">
        <Reveal className="section__head">
          <span className="eyebrow">Simple & fast</span>
          <h2>Get the care you need in <span className="gradient-text">three easy steps</span></h2>
          <p>No long phone queues, no paperwork. Booking quality healthcare has never been this effortless.</p>
        </Reveal>

        <motion.div className="steps" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
          <div className="steps__line" />
          {STEPS.map((s, i) => {
            const Icon = ICONS[s.icon]
            return (
              <motion.div className="step" key={s.title} variants={staggerItem}>
                <div className="step__num">
                  <Icon />
                  <span className="step__badge">{i + 1}</span>
                </div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
