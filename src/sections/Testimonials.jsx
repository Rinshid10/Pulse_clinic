import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { Reveal, stagger, staggerItem } from '../components/Reveal'
import { Avatar } from '../components/ui'
import { useContent } from '../hooks/useClinic'

export default function Testimonials() {
  const { testimonials: TESTIMONIALS } = useContent()
  return (
    <section className="section">
      <div className="wrap">
        <Reveal className="section__head">
          <span className="eyebrow">Patient stories</span>
          <h2>Loved by <span className="gradient-text">thousands of patients</span></h2>
          <p>Don't just take our word for it — here's what our community has to say about their experience with Pulse.</p>
        </Reveal>

        <motion.div className="tgrid" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }}>
          {TESTIMONIALS.map((t) => (
            <motion.div className="tcard" key={t.name} variants={staggerItem} whileHover={{ y: -4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="tcard__stars">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={17} fill="currentColor" />
                  ))}
                </div>
                <span className="tcard__quote">”</span>
              </div>
              <p className="tcard__text">{t.text}</p>
              <div className="tcard__who">
                <Avatar name={t.name} color={t.color} size="md" />
                <div>
                  <b>{t.name}</b>
                  <span>{t.role}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
