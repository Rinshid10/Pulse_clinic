import { useMemo, useState } from 'react'
import { Banknote, Clock3, Users, Eye, Printer, CheckCircle2, History } from 'lucide-react'
import ConfirmDialog from '../../admin/components/ConfirmDialog'
import { useToast } from '../../admin/hooks/useToast'
import { useAuth } from '../hooks/useAuth'
import { Badge } from '../../admin/components/ui'
import { fmtDate } from '../../admin/utils/format'
import PageHeader from '../../admin/components/PageHeader'
import DataTable from '../../admin/components/DataTable'
import Modal from '../../admin/components/Modal'
import StatCard from '../../admin/components/StatCard'
import { Button } from '../../admin/components/ui'
import { useStore } from '../../admin/hooks/useStore'
import * as store from '../../services/staffStore'
import { money } from '../../admin/utils/format'
import { StaffCell, MONTHS, monthLabel } from '../../components/staff-common'
import { Payslip } from '../../staff/pages/Salary'

export default function Payroll() {
  const toast = useToast()
  const { user } = useAuth()
  const [month, setMonth] = useState(store.monthOf(store.TODAY))
  const [view, setView] = useState(null)
  const [confirm, setConfirm] = useState(false)
  const [run] = useStore(() => store.getPayrollRun(month), [month])
  const [runs] = useStore(() => store.getPayrollRuns(), [])
  const [rows] = useStore(() =>
    store.getStaff().filter((s) => s.active !== false).map((s) => ({ ...s, slip: store.payslip(s.id, month) })),
  [month])

  const totals = useMemo(() => rows.reduce((a, r) => ({
    net: a.net + r.slip.net, ot: a.ot + r.slip.otAmount, otHours: a.otHours + r.slip.otHours, gross: a.gross + r.slip.gross, ded: a.ded + r.slip.totalDeductions,
  }), { net: 0, ot: 0, otHours: 0, gross: 0, ded: 0 }), [rows])

  const columns = [
    { key: 'staff', header: 'Staff', render: (r) => <StaffCell staff={r} /> },
    { key: 'basic', header: 'Basic', render: (r) => money(r.slip.basic) },
    { key: 'allow', header: 'HRA + allowances', render: (r) => money(r.slip.hra + r.slip.allowances) },
    { key: 'ot', header: 'Overtime', render: (r) => <>{money(r.slip.otAmount)}<br /><small className="ad-muted">{r.slip.otHours}h</small></> },
    { key: 'ded', header: 'Deductions', render: (r) => <>{money(r.slip.totalDeductions)}{r.slip.unpaidDays > 0 && <><br /><small className="ad-muted">{r.slip.unpaidDays} unpaid day(s)</small></>}</> },
    { key: 'net', header: 'Net pay', render: (r) => <b>{money(r.slip.net)}</b> },
    { key: 'act', header: '', width: 60, render: (r) => <div className="ad-rowact"><button title="View payslip" onClick={() => setView(r)}><Eye size={16} /></button></div> },
  ]

  return (
    <>
      <PageHeader title="Payroll" subtitle="Net pay per employee from salary structure, approved overtime and unpaid leave. Running payroll snapshots the month and marks it paid.">
        <select value={month} onChange={(e) => setMonth(e.target.value)} className="ad-select">
          {MONTHS.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
        </select>
        {run ? <Badge kind="green"><CheckCircle2 size={13} /> Paid {fmtDate(run.paidAt)} · {money(run.total)}</Badge> : <Button onClick={() => setConfirm(true)}><Banknote size={16} /> Run payroll for {monthLabel(month)}</Button>}
      </PageHeader>

      <div className="ad-grid ad-stats">
        <StatCard index={0} icon={Banknote} tone="brand" value={money(totals.net)} label={`Total net payroll · ${monthLabel(month)}`} />
        <StatCard index={1} icon={Banknote} tone="green" value={money(totals.gross)} label="Gross earnings" />
        <StatCard index={2} icon={Clock3} tone="violet" value={money(totals.ot)} label={`Overtime · ${totals.otHours}h approved`} />
        <StatCard index={3} icon={Users} tone="amber" value={rows.length} label="Staff on payroll" />
      </div>

      <div style={{ marginTop: 22 }}>
        <DataTable columns={columns} rows={rows} empty="No active staff." />
      </div>

      <div className="ad-card" style={{ marginTop: 22 }}>
        <div className="ad-card__head"><h3><History size={15} style={{ verticalAlign: -2 }} /> Payroll runs</h3></div>
        <div className="ad-card__body">
          {runs.length === 0 && <p className="ad-muted">No payroll has been run yet.</p>}
          {runs.map((r) => <div className="ad-kv" key={r.id}><span><b>{monthLabel(r.month)}</b> · {r.count} employees · run by {r.by} on {fmtDate(r.paidAt)}</span><b>{money(r.total)}</b></div>)}
        </div>
      </div>

      <ConfirmDialog open={confirm} title={`Run payroll for ${monthLabel(month)}?`} message={`${rows.length} employees · ${money(totals.net)} net. Every payslip is snapshotted and shown as paid in the staff portal.`} confirmLabel="Run payroll"
        onCancel={() => setConfirm(false)} onConfirm={() => { const r = store.runPayroll(month, user.name); setConfirm(false); toast('Payroll run', `${monthLabel(month)} · ${money(r.total)} paid`) }} />

      <Modal open={!!view} onClose={() => setView(null)} title="Payslip" subtitle={view && `${view.name} · ${monthLabel(month)}`} width={640}
        footer={<><Button variant="ghost" onClick={() => setView(null)}>Close</Button><Button onClick={() => window.print()}><Printer size={15} /> Print</Button></>}>
        {view && <Payslip staff={view} slip={view.slip} />}
      </Modal>
    </>
  )
}
