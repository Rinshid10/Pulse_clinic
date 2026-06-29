import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Briefcase, Heart, CalendarPlus } from 'lucide-react'
import { Badge } from './ui'
import { STATUS_META } from '../data/clinic'
import { initials, shade } from '../lib/utils'
import { getLeave } from '../services/clinicStore'

export default function DoctorCard({ d, onOpen, onBook }) {
  const [fav, setFav] = useState(false)
  const leave = getLeave(d.id)
  const sm = STATUS_META[d.status]
  const isAvail = d.status === 'available' && !leave

  return (
    <motion.div
      className="dcard"
      style={{ '--c': d.color }}
      variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 0.8, 0.2, 1] } } }}
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      onClick={() => onOpen(d)}
    >
      <div className="dcard__photo">
        <div className="dcard__avail">
          {leave
            ? <Badge kind="red" solid>On Leave Today{leave.type === 'half' ? ` (${leave.half})` : ''}</Badge>
            : <Badge kind={isAvail ? 'green' : sm.badge} solid>{isAvail ? 'Available today' : sm.label}</Badge>}
        </div>
        <button
          className={`dcard__fav ${fav ? 'on' : ''}`}
          onClick={(e) => { e.stopPropagation(); setFav((f) => !f) }}
          aria-label="Save"
        >
          <Heart size={17} fill={fav ? 'currentColor' : 'none'} />
        </button>
        <div
          className="dcard__ava"
          style={{ background: `linear-gradient(135deg, ${d.color}, ${shade(d.color, 50)})`, boxShadow: `0 16px 30px -10px ${d.color}` }}
        >
          {initials(d.name)}
        </div>
      </div>

      <div className="dcard__body">
        <div className="dcard__name">{d.name}</div>
        <div className="dcard__spec">{d.title}</div>

        <div className="dcard__row">
          <span className="it dcard__rate"><Star size={14} fill="currentColor" /> {d.rating}</span>
          <span className="it"><Briefcase size={14} /> {d.experience} yrs</span>
          <span className="muted" style={{ marginLeft: 'auto', fontSize: 12.5 }}>{d.reviews} reviews</span>
        </div>

        <div className="dcard__foot">
          <div className="dcard__fee">
            <b>${d.fee}</b>
            <span>per visit</span>
          </div>
          <button
            className="btn btn--primary btn--sm"
            onClick={(e) => { e.stopPropagation(); onBook(d) }}
          >
            <CalendarPlus size={16} /> Book
          </button>
        </div>
      </div>
    </motion.div>
  )
}
