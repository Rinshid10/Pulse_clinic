import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Reveal, stagger } from '../components/Reveal'
import DoctorCard from '../components/DoctorCard'
import { useDoctors } from '../hooks/useClinic'

export default function FeaturedDoctors({ go, onOpen, onBook }) {
  const DOCTORS = useDoctors()
  return (
    <section className="section" style={{ background: 'var(--bg-soft)' }} id="doctors-preview">
      <div className="wrap">
        <Reveal className="section__head">
          <span className="eyebrow">Meet the team</span>
          <h2>Care from <span className="gradient-text">leading specialists</span></h2>
          <p>Board-certified doctors with years of experience and thousands of happy patients. Get to know the people behind your care.</p>
        </Reveal>

        <motion.div className="doctors-grid" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}>
          {DOCTORS.slice(0, 4).map((d) => (
            <DoctorCard key={d.id} d={d} onOpen={onOpen} onBook={(doc) => onBook(doc)} />
          ))}
        </motion.div>

        <Reveal delay={0.1} style={{ textAlign: 'center', marginTop: 44 }}>
          <button className="btn btn--ghost btn--lg" onClick={() => go('doctors')}>
            View all doctors <ArrowRight size={18} />
          </button>
        </Reveal>
      </div>
    </section>
  )
}
