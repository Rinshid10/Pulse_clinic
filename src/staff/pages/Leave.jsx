import { useMemo, useState } from 'react'
import { Plus, FileUp, XCircle, Paperclip } from 'lucide-react'
import PageHeader from '../../admin/components/PageHeader'
import DataTable from '../../admin/components/DataTable'
import Modal from '../../admin/components/Modal'
import FormField from '../../admin/components/FormField'
import ConfirmDialog from '../../admin/components/ConfirmDialog'
import { Button } from '../../admin/components/ui'
import { useToast } from '../../admin/hooks/useToast'
import { useStore } from '../../admin/hooks/useStore'
import { useAuth } from '../hooks/useAuth'
import * as store from '../../services/staffStore'
import { LEAVE_TYPES } from '../../data/staff'
import { fmtDate } from '../../admin/utils/format'
import { StatusBadge, LeaveTypeTag } from '../../components/staff-common'

const EMPTY = { type: 'annual', from: store.TODAY, to: store.TODAY, halfDay: false, half: 'am', reason: '', medicalCert: null }

export default function Leave() {
  const { user } = useAuth()
  const toast = useToast()
  const [balance] = useStore(() => store.leaveBalance(user.id), [user.id])
  const [rows] = useStore(() => store.getLeaveRequests(user.id), [user.id])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [cancelId, setCancelId] = useState(null)
  const [filter, setFilter] = useState('all')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  const days = form.halfDay ? 0.5 : form.to >= form.from ? store.daysBetween(form.from, form.to) : 0
  const typeMeta = LEAVE_TYPES[form.type]
  const bal = balance.find((b) => b.type === form.type)
  const overQuota = typeMeta.quota > 0 && bal && days > bal.left

  const onFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return setForm((f) => ({ ...f, medicalCert: null }))
    if (file.size > 1.5 * 1024 * 1024) return toast('File too large', 'Please upload a certificate under 1.5 MB', 'warn')
    const reader = new FileReader()
    reader.onload = () => setForm((f) => ({ ...f, medicalCert: { name: file.name, dataUrl: reader.result } }))
    reader.readAsDataURL(file)
  }

  const submit = (e) => {
    e.preventDefault()
    if (days <= 0) return toast('Check the dates', 'The end date must be on or after the start date', 'warn')
    if (!form.reason.trim()) return toast('Reason required', 'Please describe the reason for your leave', 'warn')
    if (typeMeta.needsCert && !form.medicalCert && days > 1) return toast('Medical certificate needed', 'Sick leave over 1 day needs a certificate', 'warn')
    if (overQuota) return toast('Not enough balance', `You have ${bal.left} ${typeMeta.label.toLowerCase()} day(s) left`, 'warn')
    const { half, ...rest } = form
    store.applyLeave({ ...rest, half: form.halfDay ? half : undefined, staffId: user.id, to: form.halfDay ? form.from : form.to })
    toast('Leave request sent', `${typeMeta.label} · ${days} day(s) · awaiting approval`)
    setOpen(false)
    setForm(EMPTY)
  }

  const list = useMemo(() => {
    const r = filter === 'all' ? rows : rows.filter((l) => l.status === filter)
    return [...r].sort((a, b) => b.from.localeCompare(a.from))
  }, [rows, filter])

  const columns = [
    { key: 'type', header: 'Type', render: (r) => <LeaveTypeTag type={r.type} /> },
    { key: 'from', header: 'From', render: (r) => fmtDate(r.from) },
    { key: 'to', header: 'To (due date)', render: (r) => <>{fmtDate(r.to)}{r.halfDay && <small className="ad-muted"> · half day ({r.half})</small>}</> },
    { key: 'days', header: 'Days', render: (r) => <b>{r.days}</b> },
    { key: 'return', header: 'Back on', render: (r) => fmtDate(store.returnDate(r.to)) },
    { key: 'reason', header: 'Reason', render: (r) => <span title={r.reason}>{r.reason}{r.medicalCert && <span className="st-file" style={{ marginLeft: 8 }}><Paperclip size={12} />cert</span>}</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'note', header: 'Reviewer note', render: (r) => r.note ? <span className="ad-muted">{r.note}{r.reviewedBy && ` — ${r.reviewedBy}`}</span> : r.reviewedBy ? <span className="ad-muted">{r.reviewedBy}</span> : '—' },
    { key: 'act', header: '', width: 60, render: (r) => r.status === 'pending' && (
      <div className="ad-rowact"><button className="danger" title="Cancel request" onClick={() => setCancelId(r.id)}><XCircle size={16} /></button></div>
    ) },
  ]

  return (
    <>
      <PageHeader title="My Leave" subtitle="Balances for this year and every request you have made.">
        <Button onClick={() => { setForm(EMPTY); setOpen(true) }}><Plus size={16} /> Apply for leave</Button>
      </PageHeader>

      <div className="st-balance">
        {balance.map((b) => (
          <div className="st-bal" key={b.type} style={{ '--lc': b.color }}>
            <div className="st-bal__label">{b.label}</div>
            <div className="st-bal__num">
              {b.quota > 0 ? <>{b.left} <small>/ {b.quota} left</small></> : <>{b.used} <small>days used</small></>}
            </div>
            {b.quota > 0 && <div className="st-bar"><i style={{ width: `${Math.min(100, (b.used / b.quota) * 100)}%` }} /></div>}
          </div>
        ))}
      </div>

      <div className="ad-toolbar">
        <div className="ad-chips">
          {['all', 'pending', 'approved', 'rejected', 'cancelled'].map((s) => (
            <button key={s} className={`ad-chip ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>{s}</button>
          ))}
        </div>
      </div>

      <DataTable columns={columns} rows={list} empty="No leave requests yet." />

      <Modal open={open} onClose={() => setOpen(false)} title="Apply for leave" subtitle="Your manager or HR will review it."
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit}>Submit request</Button></>}>
        <form onSubmit={submit} className="ad-form-grid">
          <FormField label="Leave type" span2>
            <select value={form.type} onChange={set('type')}>
              {Object.entries(LEAVE_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}{v.quota ? ` (${balance.find((b) => b.type === k)?.left ?? v.quota} left)` : ''}</option>)}
            </select>
          </FormField>
          <FormField label="From">
            <input type="date" value={form.from} onChange={set('from')} />
          </FormField>
          <FormField label={form.halfDay ? 'To (same day)' : 'To (due date)'}>
            <input type="date" value={form.halfDay ? form.from : form.to} min={form.from} onChange={set('to')} disabled={form.halfDay} />
          </FormField>
          <FormField label="Half day?">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 13.5 }}>
              <input type="checkbox" checked={form.halfDay} onChange={set('halfDay')} style={{ width: 'auto' }} /> Only half a day
            </label>
          </FormField>
          {form.halfDay && (
            <FormField label="Which half">
              <select value={form.half} onChange={set('half')}><option value="am">Morning</option><option value="pm">Afternoon</option></select>
            </FormField>
          )}
          <FormField label="Reason" span2>
            <textarea rows="3" value={form.reason} onChange={set('reason')} placeholder={form.type === 'sick' ? 'Describe the illness / medical reason' : 'Why do you need this leave?'} />
          </FormField>
          {typeMeta.needsCert && (
            <FormField label="Medical certificate (image or PDF)" span2>
              <label className="ad-btn ad-btn--ghost" style={{ justifyContent: 'center' }}>
                <FileUp size={16} /> {form.medicalCert ? form.medicalCert.name : 'Choose file'}
                <input type="file" accept="image/*,.pdf" onChange={onFile} style={{ display: 'none' }} />
              </label>
            </FormField>
          )}
          <div className="ad-span2 st-note" style={{ background: overQuota ? 'var(--ad-red-soft)' : undefined, color: overQuota ? 'var(--ad-red)' : undefined }}>
            {days > 0 ? <>
              <b>{days} day(s)</b> · you will be back on <b>{fmtDate(store.returnDate(form.halfDay ? form.from : form.to))}</b>
              {bal && typeMeta.quota > 0 && <> · balance after approval: <b>{Math.max(0, bal.left - days)}</b> of {bal.quota}</>}
              {overQuota && ' — this exceeds your remaining balance.'}
            </> : 'Pick a valid date range.'}
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!cancelId} title="Cancel this request?" message="The request will be withdrawn and your manager will no longer see it." confirmLabel="Withdraw" danger
        onCancel={() => setCancelId(null)} onConfirm={() => { store.cancelLeave(cancelId); setCancelId(null); toast('Request withdrawn', '', 'info') }} />
    </>
  )
}
