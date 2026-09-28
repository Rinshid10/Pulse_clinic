import { useMemo, useState } from 'react'
import { Plus, Clock3, CircleDollarSign, Hourglass } from 'lucide-react'
import PageHeader from '../../admin/components/PageHeader'
import DataTable from '../../admin/components/DataTable'
import Modal from '../../admin/components/Modal'
import FormField from '../../admin/components/FormField'
import StatCard from '../../admin/components/StatCard'
import { Button } from '../../admin/components/ui'
import { useToast } from '../../admin/hooks/useToast'
import { useStore } from '../../admin/hooks/useStore'
import { useAuth } from '../hooks/useAuth'
import * as store from '../../services/staffStore'
import { fmtDate, money } from '../../admin/utils/format'
import { StatusBadge, MONTHS, monthLabel } from '../../components/staff-common'

export default function Overtime() {
  const { user, me } = useAuth()
  const toast = useToast()
  const [rows] = useStore(() => store.getOvertime(user.id), [user.id])
  const [month, setMonth] = useState(store.monthOf(store.TODAY))
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ date: store.TODAY, hours: 2, reason: '' })
  const rate = me?.salary?.otRate || 0

  const inMonth = useMemo(() => rows.filter((o) => o.date.startsWith(month)).sort((a, b) => b.date.localeCompare(a.date)), [rows, month])
  const approved = inMonth.filter((o) => o.status === 'approved')
  const pending = inMonth.filter((o) => o.status === 'pending')

  const submit = (e) => {
    e.preventDefault()
    const h = Number(form.hours)
    if (!h || h <= 0 || h > 12) return toast('Check the hours', 'Enter between 0.5 and 12 hours', 'warn')
    if (!form.reason.trim()) return toast('Reason required', 'Tell your manager why the extra hours were needed', 'warn')
    if (form.date > store.TODAY) return toast('Future date', 'Overtime can only be logged after it happened', 'warn')
    store.logOvertime({ staffId: user.id, date: form.date, hours: h, reason: form.reason })
    toast('Overtime logged', `${h}h · ${money(h * rate)} once approved`)
    setOpen(false)
    setForm({ date: store.TODAY, hours: 2, reason: '' })
  }

  const columns = [
    { key: 'date', header: 'Date', render: (r) => fmtDate(r.date) },
    { key: 'hours', header: 'Hours', render: (r) => <b>{r.hours}h</b> },
    { key: 'rate', header: 'Rate', render: (r) => `${money(r.rate)}/h` },
    { key: 'amount', header: 'Amount', render: (r) => <b>{money(r.amount)}</b> },
    { key: 'reason', header: 'Reason' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'note', header: 'Note', render: (r) => r.note ? <span className="ad-muted">{r.note}</span> : r.decidedBy ? <span className="ad-muted">{r.decidedBy}</span> : '—' },
  ]

  return (
    <>
      <PageHeader title="Overtime" subtitle={`Your overtime rate is ${money(rate)} per hour. Approved hours are added to your payslip.`}>
        <select value={month} onChange={(e) => setMonth(e.target.value)} style={{ width: 'auto' }}>
          {MONTHS.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
        </select>
        <Button onClick={() => setOpen(true)}><Plus size={16} /> Log overtime</Button>
      </PageHeader>

      <div className="ad-grid ad-stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <StatCard index={0} icon={Clock3} tone="brand" value={`${approved.reduce((a, o) => a + o.hours, 0)}h`} label="Approved hours this month" />
        <StatCard index={1} icon={CircleDollarSign} tone="green" value={money(approved.reduce((a, o) => a + o.amount, 0))} label="Overtime pay this month" />
        <StatCard index={2} icon={Hourglass} tone="amber" value={`${pending.reduce((a, o) => a + o.hours, 0)}h`} label="Awaiting approval" />
      </div>

      <div style={{ marginTop: 22 }}>
        <DataTable columns={columns} rows={inMonth} empty={`No overtime logged for ${monthLabel(month)}.`} />
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Log overtime" subtitle="Submit extra hours worked for approval." width={460}
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit}>Submit</Button></>}>
        <form onSubmit={submit} className="ad-form-grid">
          <FormField label="Date"><input type="date" value={form.date} max={store.TODAY} onChange={(e) => setForm({ ...form, date: e.target.value })} /></FormField>
          <FormField label="Hours"><input type="number" step="0.5" min="0.5" max="12" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} /></FormField>
          <FormField label="Reason" span2><textarea rows="3" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="e.g. Covered ICU for an absent colleague" /></FormField>
          <div className="ad-span2 st-note">Estimated pay: <b>{money((Number(form.hours) || 0) * rate)}</b> at {money(rate)}/h</div>
        </form>
      </Modal>
    </>
  )
}
