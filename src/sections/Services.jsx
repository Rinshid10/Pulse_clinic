import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Reveal, stagger, staggerItem } from '../components/Reveal'
import { SERVICES, DEPARTMENTS } from '../data/clinic'
import { ICONS } from '../lib/icons'
import { useContent } from '../hooks/useClinic'

export default function Services({ go }) {
  const content = useContent()
  return (
    <section className="section" id="services">
      <div className="wrap">
        <Reveal className="section__head">
          <span className="eyebrow">Our specialties</span>
          <h2>{content.servicesTitle}</h2>
          <p>{content.servicesSub}</p>
        </Reveal>

        <motion.div
          className="svc-grid"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
        >
          {SERVICES.map((s) => {
            const Icon = ICONS[s.icon]
            const color = DEPARTMENTS[s.id].color
            return (
              <motion.div
                key={s.id}
                className="svc"
                style={{ '--c': color }}
                variants={staggerItem}
                whileHover={{ y: -6 }}
                onClick={() => go('doctors')}
              >
                <div className="svc__icon" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)`, boxShadow: `0 12px 24px -10px ${color}` }}>
                  <Icon size={26} />
                </div>
                <h3>{s.id}</h3>
                <p>{s.desc}</p>
                <span className="svc__link">Find specialists <ArrowRight size={15} /></span>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
