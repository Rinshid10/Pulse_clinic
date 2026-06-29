import { useState } from 'react'
import { CalendarClock, Plane, Pencil, Plus, X, Clock } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import FormField from '../components/FormField'
import { Avatar, Badge, Button } from '../components/ui'
import { useStore } from '../hooks/useStore'
import { useToast } from '../hooks/useToast'
import * as svc from '../services/doctorService'
import { addNotification } from '../services/notificationService'
import { DAYS } from '../utils/constants'

/* ---------- per-doctor Today-Leave card ---------- */
function LeaveCard({ doctor, leave, onChange }) {
  const toast = useToast()
  const [mode, setMode] = useState(leave ? leave.type : 'available') // available | half | full
  const [half, setHalf] = useState(leave?.half || 'am')
  const [reason, setReason] = useState(leave?.reason || '')

  const apply = () => {
    if (mode === 'available') {
      svc.clearLeave(doctor.id)
      toast('Marked available', `${doctor.name} is available today`)
    } else {
      svc.setLeave(doctor.id, { type: mode, half: mode === 'half' ? half : undefined, reason })
      addNotification({ type: 'leave', title: 'Doctor on leave', body: `${doctor.name} is on ${mode === 'full' ? 'full-day' : 'half-day'} leave today.` })
      toast('Leave updated', `${doctor.name} · ${mode === 'full' ? 'Full day' : `Half day (${half})`}`, 'warn')
    }
    onChange()
  }

  return (
    <div className="ad-leave-card" style={{ '--lc': doctor.color }}>
      <div className="ad-leave-card__top">
        <Avatar name={doctor.name} color={doctor.color} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <b>{doctor.name}</b><br />
          <span>{doctor.specialty}</span>
        </div>
        {leave
          ? <Badge kind={leave.type === 'full' ? 'red' : 'amber'}>On leave</Badge>
          : <Badge kind="green">Available</Badge>}
      </div>

      <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <div className="ad-seg">
          <button className={mode === 'available' ? 'active' : ''} onClick={() => setMode('available')}>Available</button>
          <button className={mode === 'half' ? 'active' : ''} onClick={() => setMode('half')}>Half day</button>
          <button className={mode === 'full' ? 'active' : ''} onClick={() => setMode('full')}>Full day</button>
        </div>
        {mode === 'half' && (
          <div className="ad-seg">
            <button className={half === 'am' ? 'active' : ''} onClick={() => setHalf('am')}>AM</button>
            <button className={half === 'pm' ? 'active' : ''} onClick={() => setHalf('pm')}>PM</button>
          </div>
        )}
      </div>

      {mode !== 'available' && (
        <div className="ad-field" style={{ marginTop: 12 }}>
          <label>Leave reason</label>
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Medical conference" />
        </div>
      )}

      <Button block sm onClick={apply} style={{ marginTop: 12 }}>Apply for today</Button>
    </div>
  )
}

/* ---------- availability edit modal ---------- */
function AvailabilityModal({ doctor, onClose, onSaved }) {
  const toast = useToast()
  const a = doctor.availability || {}
  const [days, setDays] = useState(a.days || [])
  const [start, setStart] = useState(a.start || '09:00')
  const [end, setEnd] = useState(a.end || '17:00')
  const [slotMins, setSlotMins] = useState(a.slotMins || 30)
  const [holidays, setHolidays] = useState(a.holidays || [])
  const [newHoliday, setNewHoliday] = useState('')

  const toggleDay = (d) => setDays((arr) => (arr.includes(d) ? arr.filter((x) => x !== d) : [...arr, d]))
  const addHoliday = () => { if (newHoliday && !holidays.includes(newHoliday)) { setHolidays([...holidays, newHoliday]); setNewHoliday('') } }

  const save = () => {
    svc.setAvailability(doctor.id, { days, start, end, slotMins: Number(slotMins), holidays })
    svc.editDoctor(doctor.id, { days: days.join(', '), shift: `${start} – ${end}` })
    toast('Availability saved', doctor.name)
    onSaved()
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Availability — ${doctor.name}`}
      subtitle="Working hours, slot length and holidays"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={save}>Save</Button></>}
    >
      <FormField label="Working days">
        <div className="ad-daypills">
          {DAYS.map((d) => (
            <button key={d} className={`ad-daypill ${days.includes(d) ? 'on' : ''}`} onClick={() => toggleDay(d)}>{d}</button>
          ))}
        </div>
      </FormField>
      <div className="ad-form-grid">
        <FormField label="Start time"><input type="time" value={start} onChange={(e) => setStart(e.target.value)} /></FormField>
        <FormField label="End time"><input type="time" value={end} onChange={(e) => setEnd(e.target.value)} /></FormField>
        <FormField label="Slot length (mins)">
          <select value={slotMins} onChange={(e) => setSlotMins(e.target.value)}>
            {[15, 20, 30, 45, 60].map((m) => <option key={m} value={m}>{m} min</option>)}
          </select>
        </FormField>
      </div>
      <FormField label="Holidays / blocked dates">
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="date" value={newHoliday} onChange={(e) => setNewHoliday(e.target.value)} style={{ flex: 1 }} />
          <Button variant="ghost" sm onClick={addHoliday}><Plus size={15} /> Add</Button>
        </div>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 10 }}>
          {holidays.length === 0 && <span className="ad-muted" style={{ fontSize: 13 }}>No holidays set.</span>}
          {holidays.map((h) => (
            <span key={h} className="ad-tag">{h}<button style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'inherit', display: 'inline-flex' }} onClick={() => setHolidays(holidays.filter((x) => x !== h))}><X size={13} /></button></span>
          ))}
        </div>
      </FormField>
    </Modal>
  )
}

export default function Availability() {
  const [doctors, refresh] = useStore(() => svc.listDoctors(), [])
  const [leaves] = useStore(() => svc.listDoctors().reduce((acc, d) => ((acc[d.id] = svc.getLeave(d.id)), acc), {}), [])
  const [editDoc, setEditDoc] = useState(null)

  const onLeaveCount = Object.values(leaves).filter(Boolean).length

  return (
    <>
      <PageHeader title="Availability & Leave" subtitle={`${onLeaveCount} doctor${onLeaveCount === 1 ? '' : 's'} on leave today`} />

      <div className="ad-card" style={{ marginBottom: 20 }}>
        <div className="ad-card__head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="ad-stat__icon i-violet" style={{ width: 38, height: 38 }}><Plane size={18} /></span>
            <div><h3>Today's leave</h3><p>Changes instantly hide slots & show an "On Leave Today" badge on the website</p></div>
          </div>
        </div>
        <div className="ad-card__body">
          <div className="ad-leave-grid">
            {doctors.map((d) => (
              <LeaveCard key={d.id} doctor={d} leave={leaves[d.id]} onChange={refresh} />
            ))}
          </div>
        </div>
      </div>

      <div className="ad-card">
        <div className="ad-card__head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="ad-stat__icon i-brand" style={{ width: 38, height: 38 }}><CalendarClock size={18} /></span>
            <div><h3>Working hours & slots</h3><p>Set each doctor's schedule</p></div>
          </div>
        </div>
        <div className="ad-tablewrap">
          <table className="ad-table">
            <thead><tr><th>Doctor</th><th>Working days</th><th>Hours</th><th>Slot</th><th>Holidays</th><th></th></tr></thead>
            <tbody>
              {doctors.map((d) => {
                const a = d.availability || {}
                return (
                  <tr key={d.id}>
                    <td><div className="ad-cell-user"><Avatar name={d.name} color={d.color} size="sm" /><b>{d.name}</b></div></td>
                    <td>{(a.days || []).join(', ') || '—'}</td>
                    <td><Clock size={13} style={{ verticalAlign: -2, marginRight: 4, color: 'var(--ad-text-3)' }} />{a.start} – {a.end}</td>
                    <td><span className="ad-tag">{a.slotMins || 30} min</span></td>
                    <td>{a.holidays?.length ? <Badge kind="amber">{a.holidays.length}</Badge> : <span className="ad-muted">None</span>}</td>
                    <td><div className="ad-rowact"><button title="Edit" onClick={() => setEditDoc(d)}><Pencil size={15} /></button></div></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {editDoc && <AvailabilityModal doctor={editDoc} onClose={() => setEditDoc(null)} onSaved={() => { setEditDoc(null); refresh() }} />}
    </>
  )
}
