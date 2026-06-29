import { useMemo, useState } from 'react'
import { Check, X, CalendarClock, Search, Eye } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import FormField from '../components/FormField'
import { Avatar, Badge, Button } from '../components/ui'
import { useStore } from '../hooks/useStore'
import { useToast } from '../hooks/useToast'
import * as svc from '../services/appointmentService'
import { getDoctor } from '../../services/clinicStore'
import { STATUS_BADGE } from '../utils/constants'
import { relDay, to12h } from '../utils/format'

const STATUSES = ['all', 'confirmed', 'pending', 'completed', 'cancelled']
const DATES = [
  { k: 'all', l: 'All dates' },
  { k: '2026-06-29', l: 'Today' },
  { k: '2026-06-30', l: 'Tomorrow' },
  { k: '2026-07-01', l: 'Wed, Jul 1' },
]

export default function Appointments() {
  const toast = useToast()
  const [appts, refresh] = useStore(() => svc.listAppointments(), [])
  const [status, setStatus] = useState('all')
  const [date, setDate] = useState('all')
  const [q, setQ] = useState('')
  const [view, setView] = useState(null)
  const [resched, setResched] = useState(null)

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase()
    return appts
      .filter((a) => {
        const d = getDoctor(a.doctorId)
        return (status === 'all' || a.status === status) && (date === 'all' || a.date === date) &&
          (a.patient + (d?.name || '') + a.type + a.reason).toLowerCase().includes(query)
      })
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
  }, [appts, status, date, q])

  const act = (fn, id, msg, kind = 'success') => { fn(id); toast(msg, '', kind); refresh() }

  const columns = [
    { key: 'patient', header: 'Patient', render: (a) => (
      <div className="ad-cell-user"><Avatar name={a.patient} size="sm" /><div><b>{a.patient}</b><br /><small>{a.age} yrs · {a.reason}</small></div></div>
    ) },
    { key: 'doctor', header: 'Doctor', render: (a) => { const d = getDoctor(a.doctorId); return (
      <div className="ad-cell-user"><Avatar name={d?.name || '?'} color={d?.color} size="sm" /><div><b>{d?.name?.replace('Dr. ', '') || '—'}</b><br /><small>{d?.specialty}</small></div></div>
    ) } },
    { key: 'time', header: 'Date & time', render: (a) => <div><b>{to12h(a.time)}</b><br /><small className="ad-muted">{relDay(a.date)}</small></div> },
    { key: 'type', header: 'Type', render: (a) => <span className="ad-tag">{a.type}</span> },
    { key: 'status', header: 'Status', render: (a) => { const s = STATUS_BADGE[a.status]; return <Badge kind={s.kind}>{s.label}</Badge> } },
    { key: 'actions', header: '', width: 160, render: (a) => (
      <div className="ad-rowact">
        <button title="View" onClick={() => setView(a)}><Eye size={15} /></button>
        {a.status !== 'confirmed' && a.status !== 'completed' && <button className="go" title="Confirm" onClick={() => act(svc.confirm, a.id, 'Appointment confirmed')}><Check size={15} /></button>}
        <button title="Reschedule" onClick={() => setResched({ ...a })}><CalendarClock size={15} /></button>
        {a.status !== 'cancelled' && <button className="danger" title="Cancel" onClick={() => act(svc.cancel, a.id, 'Appointment cancelled', 'warn')}><X size={15} /></button>}
      </div>
    ) },
  ]

  const saveResched = () => {
    svc.reschedule(resched.id, resched.date, resched.time)
    toast('Appointment rescheduled', `${resched.patient} · ${relDay(resched.date)} ${to12h(resched.time)}`)
    setResched(null)
    refresh()
  }

  return (
    <>
      <PageHeader title="Appointments" subtitle={`${rows.length} shown`} />

      <div className="ad-toolbar">
        <div className="ad-search" style={{ marginLeft: 0 }}>
          <Search size={16} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patient or doctor…" />
        </div>
        <div className="ad-chips">
          {STATUSES.map((s) => (
            <button key={s} className={`ad-chip ${status === s ? 'active' : ''}`} onClick={() => setStatus(s)}>{s === 'all' ? 'All statuses' : STATUS_BADGE[s].label}</button>
          ))}
        </div>
        <div className="ad-chips" style={{ marginLeft: 'auto' }}>
          {DATES.map((d) => (
            <button key={d.k} className={`ad-chip ${date === d.k ? 'active' : ''}`} onClick={() => setDate(d.k)}>{d.l}</button>
          ))}
        </div>
      </div>

      <DataTable columns={columns} rows={rows} empty="No appointments match your filters." />

      {/* View modal */}
      <Modal open={!!view} onClose={() => setView(null)} title="Appointment details"
        footer={<Button variant="ghost" onClick={() => setView(null)}>Close</Button>}>
        {view && (() => { const d = getDoctor(view.doctorId); const s = STATUS_BADGE[view.status]; return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <Avatar name={view.patient} size="lg" />
              <div><b style={{ fontSize: 17 }}>{view.patient}</b><br /><span className="ad-muted">{view.age} years old</span></div>
              <span style={{ marginLeft: 'auto' }}><Badge kind={s.kind}>{s.label}</Badge></span>
            </div>
            <div className="ad-kv"><span>Date</span><b>{relDay(view.date)}</b></div>
            <div className="ad-kv"><span>Time</span><b>{to12h(view.time)}</b></div>
            <div className="ad-kv"><span>Type</span><b>{view.type}</b></div>
            <div className="ad-kv"><span>Reason</span><b>{view.reason}</b></div>
            <div className="ad-kv"><span>Doctor</span><b>{d?.name} · {d?.specialty}</b></div>
          </div>
        ) })()}
      </Modal>

      {/* Reschedule modal */}
      <Modal open={!!resched} onClose={() => setResched(null)} title="Reschedule appointment" subtitle={resched?.patient}
        footer={<><Button variant="ghost" onClick={() => setResched(null)}>Cancel</Button><Button onClick={saveResched}>Save</Button></>}>
        {resched && (
          <div className="ad-form-grid">
            <FormField label="New date"><input type="date" value={resched.date} onChange={(e) => setResched({ ...resched, date: e.target.value })} /></FormField>
            <FormField label="New time"><input type="time" value={resched.time} onChange={(e) => setResched({ ...resched, time: e.target.value })} /></FormField>
          </div>
        )}
      </Modal>
    </>
  )
}
