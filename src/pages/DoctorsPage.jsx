import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, SearchX } from 'lucide-react'
import DoctorCard from '../components/DoctorCard'
import { stagger } from '../components/Reveal'
import { DEPARTMENTS } from '../data/clinic'
import { useDoctors } from '../hooks/useClinic'

export default function DoctorsPage({ onOpen, onBook }) {
  const DOCTORS = useDoctors()
  const [filter, setFilter] = useState('All')
  const [q, setQ] = useState('')
  const specialties = ['All', ...Object.keys(DEPARTMENTS)]

  const list = useMemo(() => {
    const query = q.trim().toLowerCase()
    return DOCTORS.filter(
      (d) =>
        (filter === 'All' || d.specialty === filter) &&
        (d.name + d.specialty + d.title).toLowerCase().includes(query)
    )
  }, [DOCTORS, filter, q])

  return (
    <>
      <section className="dpage-hero">
        <span className="blob blob--1" style={{ opacity: 0.4 }} />
        <div className="wrap" style={{ position: 'relative' }}>
          <motion.span className="eyebrow" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            Our specialists
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.08 }}>
            Find your <span className="gradient-text">perfect doctor</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.16 }}>
            Browse {DOCTORS.length} certified specialists across {Object.keys(DEPARTMENTS).length} departments and book in seconds.
          </motion.p>

          <div className="toolbar">
            <div className="dsearch">
              <Search size={18} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or specialty…" />
            </div>
          </div>
          <div className="chips">
            {specialties.map((s) => (
              <button key={s} className={`chip ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 36 }}>
        <div className="wrap">
          {list.length ? (
            <motion.div
              className="doctors-grid"
              variants={stagger}
              initial="hidden"
              animate="show"
              key={filter + q}
            >
              {list.map((d) => (
                <DoctorCard key={d.id} d={d} onOpen={onOpen} onBook={(doc) => onBook(doc)} />
              ))}
            </motion.div>
          ) : (
            <div className="empty">
              <SearchX />
              <p>No doctors match your search. Try a different specialty.</p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
