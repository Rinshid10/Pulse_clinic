import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, MapPin, Clock, Languages, Briefcase, GraduationCap, CalendarPlus } from 'lucide-react'
import { Avatar } from './ui'
import { initials, shade } from '../lib/utils'
import { getLeave, availableSlotsToday } from '../services/clinicStore'

const SLOTS = ['09:00', '10:30', '11:15', '13:00', '14:30', '15:45', '16:30', '17:15']

export default function DoctorModal({ doctor, onClose, onBook }) {
  useEffect(() => {
    if (!doctor) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [doctor, onClose])

  return (
    <AnimatePresence>
      {doctor && (
          <motion.div className="scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            className="modal" style={{ '--c': doctor.color }}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.28, ease: [0.22, 0.8, 0.2, 1] }}
          >
            <div className="dmodal__hero">
              <div
                className="avatar"
                style={{ width: 76, height: 76, fontSize: 28, background: `linear-gradient(135deg, ${shade(doctor.color, -30)}, ${shade(doctor.color, 40)})` }}
              >
                {initials(doctor.name)}
              </div>
              <div>
                <h3>{doctor.name}</h3>
                <div className="sub">{doctor.title}</div>
                <div className="meta">
                  <span><Star size={14} fill="currentColor" /> {doctor.rating} ({doctor.reviews})</span>
                  <span><MapPin size={14} /> Room {doctor.room}</span>
                </div>
              </div>
              <button className="icon-btn" onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,.2)', border: 'none', color: '#fff' }}>
                <X size={18} />
              </button>
            </div>

            <div className="modal__body">
              <p style={{ color: 'var(--text-2)', fontSize: 14.5, lineHeight: 1.65 }}>{doctor.bio}</p>

              <div>
                <div className="kv"><span><Briefcase size={15} style={{ verticalAlign: -3, marginRight: 6 }} />Experience</span><b>{doctor.experience} years</b></div>
                <div className="kv"><span><GraduationCap size={15} style={{ verticalAlign: -3, marginRight: 6 }} />Department</span><b>{doctor.specialty}</b></div>
                <div className="kv"><span><Languages size={15} style={{ verticalAlign: -3, marginRight: 6 }} />Languages</span><b>{doctor.languages.join(', ')}</b></div>
                <div className="kv"><span><Clock size={15} style={{ verticalAlign: -3, marginRight: 6 }} />Available</span><b>{doctor.days} · {doctor.shift}</b></div>
                <div className="kv"><span>Consultation fee</span><b style={{ color: 'var(--c)' }}>${doctor.fee}</b></div>
              </div>

              <div>
                <h4 style={{ fontSize: 12.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-3)', marginBottom: 12 }}>
                  Available slots — Today
                </h4>
                {(() => {
                  const leave = getLeave(doctor.id)
                  const slots = availableSlotsToday(doctor.id, SLOTS)
                  if (leave && slots.length === 0) {
                    return (
                      <div style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--danger-soft)', color: 'var(--danger)', fontSize: 13.5, fontWeight: 600 }}>
                        On leave today{leave.reason ? ` — ${leave.reason}` : ''}. Please pick another date or doctor.
                      </div>
                    )
                  }
                  return (
                    <>
                      {leave && (
                        <p style={{ fontSize: 12.5, color: 'var(--warn)', fontWeight: 700, marginBottom: 10 }}>
                          Half-day leave ({leave.half}) — limited slots available.
                        </p>
                      )}
                      <div className="slotgrid">
                        {slots.map((s) => (
                          <button key={s} className="slotbtn" onClick={() => onBook(doctor, s)}>{s}</button>
                        ))}
                      </div>
                    </>
                  )
                })()}
              </div>
            </div>

            <div className="modal__foot">
              <button className="btn btn--ghost" onClick={onClose}>Close</button>
              <button className="btn btn--primary" onClick={() => onBook(doctor)}>
                <CalendarPlus size={17} /> Book appointment
              </button>
            </div>
          </motion.div>
          </motion.div>
      )}
    </AnimatePresence>
  )
}
