import { motion } from 'framer-motion'
import { CalendarPlus, CalendarX2, Clock, Stethoscope, X, CheckCircle2 } from 'lucide-react'
import { stagger, staggerItem } from '../components/Reveal'
import { Avatar, Badge } from '../components/ui'
import { docById, fmtDate, relDay, to12h } from '../lib/utils'

const STATUS_BADGE = {
  Booked: 'amber',
  Confirmed: 'green',
  Cancelled: 'red',
}

export default function MyBookings({ bookings, onBook, onCancel }) {
  return (
    <>
      <section className="dpage-hero">
        <span className="blob blob--1" style={{ opacity: 0.4 }} />
        <div className="wrap" style={{ position: 'relative' }}>
          <motion.span className="eyebrow" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            Your appointments
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.08 }}>
            My <span className="gradient-text">bookings</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.16 }}>
            {bookings.length
              ? `You have ${bookings.length} appointment${bookings.length === 1 ? '' : 's'} booked.`
              : 'Your booked appointments will appear here.'}
          </motion.p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 30 }}>
        <div className="wrap">
          {bookings.length === 0 ? (
            <div className="empty">
              <CalendarX2 />
              <p>No bookings yet — let's get you scheduled.</p>
              <button className="btn btn--primary btn--lg" style={{ marginTop: 18 }} onClick={() => onBook()}>
                <CalendarPlus size={18} /> Book an appointment
              </button>
            </div>
          ) : (
            <motion.div className="bk-grid" variants={stagger} initial="hidden" animate="show">
              {bookings.map((b) => {
                const d = docById(b.doctorId)
                return (
                  <motion.div className="bk-card" key={b.id} style={{ '--c': d.color }} variants={staggerItem}>
                    <div className="bk-card__top">
                      <Avatar name={d.name} color={d.color} size="lg" />
                      <div style={{ minWidth: 0 }}>
                        <div className="bk-card__doc">{d.name}</div>
                        <div className="bk-card__spec">{d.specialty}</div>
                      </div>
                      <Badge kind={STATUS_BADGE[b.status] || 'gray'}>{b.status}</Badge>
                    </div>

                    <div className="bk-card__rows">
                      <div className="bk-row">
                        <Clock size={16} />
                        <span>{fmtDate(b.date)} · {relDay(b.date)}</span>
                        <b>{to12h(b.time)}</b>
                      </div>
                      <div className="bk-row">
                        <Stethoscope size={16} />
                        <span>Visit type</span>
                        <b>{b.type}</b>
                      </div>
                      <div className="bk-row">
                        <CheckCircle2 size={16} />
                        <span>Patient</span>
                        <b>{b.name}</b>
                      </div>
                    </div>

                    {b.reason && <p className="bk-card__reason">“{b.reason}”</p>}

                    {b.status !== 'Cancelled' && (
                      <div className="bk-card__foot">
                        <button className="btn btn--ghost btn--sm" onClick={() => onCancel(b.id)}>
                          <X size={15} /> Cancel
                        </button>
                        <button className="btn btn--primary btn--sm" onClick={() => onBook(d)}>
                          <CalendarPlus size={15} /> Book again
                        </button>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </div>
      </section>
    </>
  )
}
