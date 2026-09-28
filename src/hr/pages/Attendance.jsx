import { useMemo, useState } from 'react'
import { Download, Clock3, CalendarOff, Users } from 'lucide-react'
import PageHeader from '../../admin/components/PageHeader'
import DataTable from '../../admin/components/DataTable'
import StatCard from '../../admin/components/StatCard'
import { Badge, Button } from '../../admin/components/ui'
import { useStore } from '../../admin/hooks/useStore'
import { useToast } from '../../admin/hooks/useToast'
import * as store from '../../services/staffStore'
import { SHIFTS } from '../../data/staff'
import { StaffCell, MONTHS, monthLabel } from '../../components/staff-common'

export default function Attendance() {
  const toast = useToast()
  const [month, setMonth] = useState(store.monthOf(store.TODAY))
  const [dept, setDept] = useState('all')
  const [rows] = useStore(() => store.attendance(month).filter((s) => s.active !== false), [month])
  const list = useMemo(() => rows.filter((r) => dept === 'all' || r.dept === dept).sort((a, b) => b.hours - a.hours), [rows, dept])
  const totals = { hours: list.reduce((a, r) => a + r.hours, 0), ot: list.reduce((a, r) => a + r.ot, 0), leave: list.reduce((a, r) => a + r.leaveDays, 0) }

  const exportCsv = () => {
    const head = ['Employee ID', 'Name', 'Department', 'Designation', 'Shifts', 'Hours in clinic', 'Overtime hours', 'Leave days', 'All-time hours']
    const lines = list.map((r) => [r.empId, r.name, r.dept, r.designation, r.shifts, r.hours, r.ot, r.leaveDays, r.allTimeHours])
    const csv = [head, ...lines].map((l) => l.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `attendance-${month}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
    toast('CSV downloaded', `attendance-${month}.csv`)
  }

  const columns = [
    { key: 'staff', header: 'Employee', render: (r) => <StaffCell staff={r} /> },
    { key: 'today', header: 'Today', render: (r) => r.onLeaveToday ? <Badge kind="amber">On leave</Badge> : (() => { const t = store.timeSummary(r.id).today; return t ? <span className="ad-tag" style={{ color: SHIFTS[t.shift]?.color }}>{SHIFTS[t.shift]?.label} · {t.ward}</span> : <span className="ad-muted">Off</span> })() },
    { key: 'shifts', header: 'Shifts', render: (r) => <b>{r.shifts}</b> },
    { key: 'hours', header: 'Hours in clinic', render: (r) => <><b>{r.hours}h</b><br /><small className="ad-muted">{r.shifts * store.SHIFT_HOURS}h shifts + {r.ot}h OT</small></> },
    { key: 'leave', header: 'Leave days', render: (r) => r.leaveDays > 0 ? <Badge kind="amber">{r.leaveDays}</Badge> : <span className="ad-muted">0</span> },
    { key: 'all', header: 'All time', render: (r) => <>{r.allTimeHours}h<br /><small className="ad-muted">{r.daysWorked} days</small></> },
  ]

  return (
    <>
      <PageHeader title="Attendance" subtitle={`Each rostered shift counts ${store.SHIFT_HOURS} hours; approved overtime is added.`}>
        <select value={month} onChange={(e) => setMonth(e.target.value)} className="ad-select">
          {MONTHS.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
        </select>
        <Button variant="ghost" onClick={exportCsv}><Download size={16} /> Export CSV</Button>
      </PageHeader>

      <div className="ad-grid ad-stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 18 }}>
        <StatCard index={0} icon={Clock3} tone="brand" value={`${totals.hours}h`} label={`Hours in clinic · ${monthLabel(month)}`} />
        <StatCard index={1} icon={Clock3} tone="violet" value={`${totals.ot}h`} label="Approved overtime" />
        <StatCard index={2} icon={CalendarOff} tone="amber" value={totals.leave} label="Leave days taken" trend={`${list.length} employees`} up />
      </div>

      <div className="ad-toolbar">
        <div className="ad-chips">
          {['all', ...new Set(rows.map((r) => r.dept))].map((d) => <button key={d} className={`ad-chip ${dept === d ? 'active' : ''}`} onClick={() => setDept(d)}>{d}</button>)}
        </div>
      </div>

      <DataTable columns={columns} rows={list} empty="No employees." />
    </>
  )
}
