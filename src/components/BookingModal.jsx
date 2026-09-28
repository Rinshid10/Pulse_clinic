import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, CalendarDays, Clock, Stethoscope, ClipboardList } from 'lucide-react'
import { TYPE_META } from '../data/clinic'
import { useToast } from '../hooks/useToast'
import { useDoctors } from '../hooks/useClinic'
import { useIsMobile } from '../hooks/useIsMobile'

export default function BookingModal({ open, preset, onClose, onConfirm, onViewBookings }) {
  const toast = useToast()
  const DOCTORS = useDoctors()
  const isMobile = useIsMobile()
  const [done, setDone] = useState(false)
  const [form, setForm] = useState({
    name: '', phone: '', doctorId: '',
    date: '2026-06-29', time: '09:00', type: 'Consultation', reason: '',
  })

  useEffect(() => {
    if (open) {
      setDone(false)
      setForm((f) => ({
        ...f,
        doctorId: preset?.doctor?.id || f.doctorId || DOCTORS[0]?.id || '',
        time: preset?.time || f.time,
      }))
    }
  }, [open, preset])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    if (open) {
      window.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    }
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open, onClose])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast('Name required', 'Please enter your full name', 'info')
    if (!form.phone.trim()) return toast('Phone required', 'We need a number to confirm', 'info')
    const doc = DOCTORS.find((d) => d.id === form.doctorId)
    onConfirm?.({ ...form })
    setDone(true)
    // On mobile the confirmation takes over the whole screen, so a toast would only overlap it.
    if (!isMobile) toast('Appointment booked', `${doc?.name || 'Doctor'} · ${form.date} at ${form.time}`)
  }

  const bookedDoctor = DOCTORS.find((d) => d.id === form.doctorId)
  const fullscreen = done && isMobile

  return (
    <AnimatePresence>
      {open && (
          <motion.div className={`scrim${fullscreen ? ' scrim--fullscreen' : ''}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            className={`modal${fullscreen ? ' modal--fullscreen' : ''}`}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.28, ease: [0.22, 0.8, 0.2, 1] }}
          >
            {done ? (
              <div className="booked">
                {fullscreen && (
                  <button type="button" className="icon-btn booked__close" onClick={onClose} aria-label="Close"><X size={18} /></button>
                )}
                <div className="booked__main">
                  <motion.div
                    className="booked__icon"
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 220, damping: 14 }}
                  >
                    <CheckCircle2 size={42} />
                  </motion.div>
                  <h3 className="booked__title">You're all set!</h3>
                  <div style={{ marginTop: 14 }}>
                    <span className="badge badge--amber">Booked</span>
                  </div>
                  <p className="booked__text">
                    Your appointment is booked. Our team will call {form.phone} shortly to confirm. You can track its
                    status anytime under <b>My bookings</b>.
                  </p>

                  {fullscreen && (
                    <div className="booked__summary">
                      <div className="booked__row"><Stethoscope size={16} /><span>Doctor</span><b>{bookedDoctor?.name || 'Doctor'}</b></div>
                      <div className="booked__row"><CalendarDays size={16} /><span>Date</span><b>{form.date}</b></div>
                      <div className="booked__row"><Clock size={16} /><span>Time</span><b>{form.time}</b></div>
                      <div className="booked__row"><ClipboardList size={16} /><span>Visit</span><b>{form.type}</b></div>
                    </div>
                  )}
                </div>

                <div className="booked__actions">
                  <button className="btn btn--ghost btn--lg" onClick={onClose}>Done</button>
                  <button className="btn btn--primary btn--lg" onClick={onViewBookings}>View my bookings</button>
                </div>
              </div>
            ) : (
              <form onSubmit={submit}>
                <div className="modal__head">
                  <div>
                    <h3>Book an appointment</h3>
                    <p>Tell us a few details and we'll confirm within minutes.</p>
                  </div>
                  <button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
                </div>

                <div className="modal__body">
                  <div className="field-row">
                    <div className="field">
                      <label>Full name</label>
                      <input value={form.name} onChange={set('name')} placeholder="Jane Doe" autoFocus />
                    </div>
                    <div className="field">
                      <label>Phone number</label>
                      <input value={form.phone} onChange={set('phone')} placeholder="+1 (415) 555-0000" />
                    </div>
                  </div>

                  <div className="field">
                    <label>Choose a doctor</label>
                    <select value={form.doctorId} onChange={set('doctorId')}>
                      {DOCTORS.map((d) => (
                        <option key={d.id} value={d.id}>{d.name} — {d.specialty}</option>
                      ))}
                    </select>
                  </div>

                  <div className="field-row">
                    <div className="field">
                      <label>Preferred date</label>
                      <input type="date" value={form.date} onChange={set('date')} />
                    </div>
                    <div className="field">
                      <label>Preferred time</label>
                      <input type="time" value={form.time} onChange={set('time')} />
                    </div>
                  </div>

                  <div className="field">
                    <label>Visit type</label>
                    <select value={form.type} onChange={set('type')}>
                      {Object.keys(TYPE_META).map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>

                  <div className="field">
                    <label>Reason for visit <span className="muted" style={{ fontWeight: 500 }}>(optional)</span></label>
                    <textarea rows="2" value={form.reason} onChange={set('reason')} placeholder="Briefly describe your symptoms…" />
                  </div>
                </div>

                <div className="modal__foot">
                  <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
                  <button type="submit" className="btn btn--primary">Confirm booking</button>
                </div>
              </form>
            )}
          </motion.div>
          </motion.div>
      )}
    </AnimatePresence>
  )
}
