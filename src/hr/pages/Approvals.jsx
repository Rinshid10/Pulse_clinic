import { useMemo, useState } from 'react'
import { Check, X, Paperclip } from 'lucide-react'
import PageHeader from '../../admin/components/PageHeader'
import DataTable from '../../admin/components/DataTable'
import Modal from '../../admin/components/Modal'
import FormField from '../../admin/components/FormField'
import { Button } from '../../admin/components/ui'
import { useToast } from '../../admin/hooks/useToast'
import { useStore } from '../../admin/hooks/useStore'
import { useAuth } from '../hooks/useAuth'
import * as store from '../../services/staffStore'
import { SHIFTS } from '../../data/staff'
import { fmtDate, money } from '../../admin/utils/format'
import { StatusBadge, StaffCell, LeaveTypeTag } from '../../components/staff-common'

const TABS = [['leave', 'Leave'], ['shifts', 'Shift changes'], ['overtime', 'Overtime']]

export default function Approvals() {
  const { user } = useAuth()
  const toast = useToast()
  const [tab, setTab] = useState('leave')
  const [showHistory, setShowHistory] = useState(false)
  const [decision, setDecision] = useState(null) // { kind, id, status, note, label }

  const [data] = useStore(() => ({
    leave: store.getLeaveRequests(), shifts: store.getShiftRequests(), overtime: store.getOvertime(),
    staffById: Object.fromEntries(store.getStaff().map((s) => [s.id, s])),
  }), [])

  const rows = useMemo(() => {
    const list = data[tab]
    const sorted = [...list].sort((a, b) => (b.appliedAt || b.createdAt || b.date || '').localeCompare(a.appliedAt || a.createdAt || a.date || ''))
    return showHistory ? sorted.filter((r) => r.status !== 'pending') : sorted.filter((r) => r.status === 'pending')
  }, [data, tab, showHistory])

  const counts = { leave: data.leave.filter((r) => r.status === 'pending').length, shifts: data.shifts.filter((r) => r.status === 'pending').length, overtime: data.overtime.filter((r) => r.status === 'pending').length }

  const confirm = () => {
    const { kind, id, status, note } = decision
    if (kind === 'leave') store.decideLeave(id, status, user.name, note)
    if (kind === 'shifts') store.decideShiftRequest(id, status, user.name, note)
    if (kind === 'overtime') store.decideOvertime(id, status, user.name, note)
    toast(status === 'approved' ? 'Approved' : 'Rejected', decision.label, status === 'approved' ? 'success' : 'info')
    setDecision(null)
  }

  const actions = (kind, r, label) => (
    <div className="ad-rowact">
      <button className="go" title="Approve" onClick={() => setDecision({ kind, id: r.id, status: 'approved', note: '', label })}><Check size={16} /></button>
      <button className="danger" title="Reject" onClick={() => setDecision({ kind, id: r.id, status: 'rejected', note: '', label })}><X size={16} /></button>
    </div>
  )
  const outcome = (r) => (
    <>
      <StatusBadge status={r.status} />
      {(r.reviewedBy || r.decidedBy) && <small className="ad-muted" style={{ display: 'block', marginTop: 4 }}>{r.reviewedBy || r.decidedBy}{r.note && ` — ${r.note}`}</small>}
    </>
  )

  const leaveCols = [
    { key: 'staff', header: 'Staff', render: (r) => <StaffCell staff={data.staffById[r.staffId]} /> },
    { key: 'type', header: 'Type', render: (r) => <LeaveTypeTag type={r.type} /> },
    { key: 'dates', header: 'Dates', render: (r) => <>{fmtDate(r.from)} → {fmtDate(r.to)}<br /><small className="ad-muted">{r.days} day(s){r.halfDay ? ` · half (${r.half})` : ''} · back {fmtDate(store.returnDate(r.to))}</small></> },
    { key: 'balance', header: 'Balance left', render: (r) => { const b = store.leaveBalance(r.staffId).find((x) => x.type === r.type); return b?.quota ? <b style={{ color: b.left < r.days ? 'var(--ad-red)' : undefined }}>{b.left} / {b.quota}</b> : '—' } },
    { key: 'reason', header: 'Reason', render: (r) => <>{r.reason}{r.medicalCert && (r.medicalCert.dataUrl ? <a className="st-file" href={r.medicalCert.dataUrl} target="_blank" rel="noreferrer" style={{ marginLeft: 8 }}><Paperclip size={12} />{r.medicalCert.name}</a> : <span className="st-file" style={{ marginLeft: 8 }}><Paperclip size={12} />{r.medicalCert.name}</span>)}</> },
    { key: 'applied', header: 'Applied', render: (r) => fmtDate(r.appliedAt) },
    { key: 'act', header: showHistory ? 'Outcome' : '', width: 100, render: (r) => showHistory ? outcome(r) : actions('leave', r, `${data.staffById[r.staffId]?.name} · leave ${r.from}`) },
  ]

  const shiftCols = [
    { key: 'from', header: 'Requested by', render: (r) => <StaffCell staff={data.staffById[r.fromStaffId]} /> },
    { key: 'kind', header: 'Type', render: (r) => <b style={{ textTransform: 'capitalize' }}>{r.kind}</b> },
    { key: 'shift', header: 'Their shift', render: (r) => { const s = store.getShift(r.shiftId); return s ? <>{fmtDate(s.date)}<br /><small className="ad-muted">{SHIFTS[s.shift]?.label} · {s.ward}</small></> : '—' } },
    { key: 'to', header: 'With', render: (r) => { const t = r.targetShiftId ? store.getShift(r.targetShiftId) : null; return <StaffCell staff={data.staffById[r.toStaffId]} sub={t ? `${fmtDate(t.date)} · ${SHIFTS[t.shift]?.label}` : 'takes the shift'} /> } },
    { key: 'reason', header: 'Reason' },
    { key: 'act', header: showHistory ? 'Outcome' : '', width: 100, render: (r) => showHistory ? outcome(r) : actions('shifts', r, `${data.staffById[r.fromStaffId]?.name} · ${r.kind}`) },
  ]

  const otCols = [
    { key: 'staff', header: 'Staff', render: (r) => <StaffCell staff={data.staffById[r.staffId]} /> },
    { key: 'date', header: 'Date', render: (r) => fmtDate(r.date) },
    { key: 'hours', header: 'Hours', render: (r) => <b>{r.hours}h</b> },
    { key: 'amount', header: 'Amount', render: (r) => <>{money(r.amount)}<br /><small className="ad-muted">{money(r.rate)}/h</small></> },
    { key: 'reason', header: 'Reason' },
    { key: 'act', header: showHistory ? 'Outcome' : '', width: 100, render: (r) => showHistory ? outcome(r) : actions('overtime', r, `${data.staffById[r.staffId]?.name} · ${r.hours}h overtime`) },
  ]

  const cols = { leave: leaveCols, shifts: shiftCols, overtime: otCols }[tab]

  return (
    <>
      <PageHeader title="Approvals" subtitle="Review pending requests from your team.">
        <div className="ad-seg">
          <button className={!showHistory ? 'active' : ''} onClick={() => setShowHistory(false)}>Pending</button>
          <button className={showHistory ? 'active' : ''} onClick={() => setShowHistory(true)}>History</button>
        </div>
      </PageHeader>

      <div className="ad-toolbar">
        <div className="ad-chips">
          {TABS.map(([k, l]) => (
            <button key={k} className={`ad-chip ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{l}{counts[k] > 0 && ` (${counts[k]})`}</button>
          ))}
        </div>
      </div>

      <DataTable columns={cols} rows={rows} empty={showHistory ? 'No decisions yet.' : 'All caught up — nothing pending.'} />

      <Modal open={!!decision} onClose={() => setDecision(null)} title={decision?.status === 'approved' ? 'Approve request' : 'Reject request'} subtitle={decision?.label} width={440}
        footer={<><Button variant="ghost" onClick={() => setDecision(null)}>Cancel</Button><Button variant={decision?.status === 'approved' ? 'primary' : 'danger'} onClick={confirm}>{decision?.status === 'approved' ? 'Approve' : 'Reject'}</Button></>}>
        {decision && (
          <FormField label={decision.status === 'approved' ? 'Note (optional)' : 'Reason for rejection'}>
            <textarea rows="3" value={decision.note} onChange={(e) => setDecision({ ...decision, note: e.target.value })} placeholder={decision.status === 'approved' ? 'Anything the staff member should know' : 'Explain so they can plan around it'} autoFocus />
          </FormField>
        )}
      </Modal>
    </>
  )
}
