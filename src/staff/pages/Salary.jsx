import { useState } from 'react'
import { Printer, Wallet, Clock3, MinusCircle } from 'lucide-react'
import PageHeader from '../../admin/components/PageHeader'
import StatCard from '../../admin/components/StatCard'
import { Button } from '../../admin/components/ui'
import { useStore } from '../../admin/hooks/useStore'
import { useAuth } from '../hooks/useAuth'
import * as store from '../../services/staffStore'
import { money } from '../../admin/utils/format'
import { MONTHS, monthLabel } from '../components/common'

export function Payslip({ staff, slip }) {
  if (!slip) return null
  return (
    <div className="st-slip">
      <div className="st-slip__head">
        <div>
          <b>{staff.name}</b>
          <span>{staff.designation} · {staff.dept} · {staff.empId}</span>
        </div>
        <div className="st-slip__net">
          <span>Net pay · {monthLabel(slip.month)}</span>
          <b>{money(slip.net)}</b>
        </div>
      </div>
      <div className="st-slip__cols">
        <div className="st-slip__col">
          <h4>Earnings</h4>
          <div className="ad-kv"><span>Basic salary</span><b>{money(slip.basic)}</b></div>
          <div className="ad-kv"><span>House rent allowance</span><b>{money(slip.hra)}</b></div>
          <div className="ad-kv"><span>Other allowances</span><b>{money(slip.allowances)}</b></div>
          <div className="ad-kv"><span>Overtime ({slip.otHours}h × {money(slip.otRate)})</span><b>{money(slip.otAmount)}</b></div>
          <div className="ad-kv"><span><b>Gross</b></span><b>{money(slip.gross)}</b></div>
        </div>
        <div className="st-slip__col">
          <h4>Deductions</h4>
          <div className="ad-kv"><span>Tax &amp; insurance</span><b>{money(slip.deductions)}</b></div>
          <div className="ad-kv"><span>Unpaid leave ({slip.unpaidDays} day{slip.unpaidDays === 1 ? '' : 's'} × {money(slip.dailyRate)})</span><b>{money(slip.unpaidDeduction)}</b></div>
          <div className="ad-kv"><span><b>Total deductions</b></span><b>{money(slip.totalDeductions)}</b></div>
        </div>
      </div>
      <div className="st-slip__total"><span>Net payable</span><span>{money(slip.net)}</span></div>
    </div>
  )
}

export default function Salary() {
  const { user, me } = useAuth()
  const [month, setMonth] = useState(store.monthOf(store.TODAY))
  const [slip] = useStore(() => store.payslip(user.id, month), [user.id, month])
  if (!me || !slip) return null

  return (
    <>
      <PageHeader title="Salary" subtitle="Your pay structure and monthly payslips.">
        <select value={month} onChange={(e) => setMonth(e.target.value)} style={{ width: 'auto' }}>
          {MONTHS.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
        </select>
        <span className="st-noprint"><Button variant="ghost" onClick={() => window.print()}><Printer size={16} /> Print payslip</Button></span>
      </PageHeader>

      <div className="ad-grid ad-stats st-noprint" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <StatCard index={0} icon={Wallet} tone="brand" value={money(slip.net)} label={`Net pay · ${monthLabel(month)}`} />
        <StatCard index={1} icon={Clock3} tone="violet" value={money(slip.otAmount)} label={`Overtime · ${slip.otHours}h approved`} />
        <StatCard index={2} icon={MinusCircle} tone="red" value={money(slip.totalDeductions)} label="Total deductions" />
      </div>

      <div className="ad-grid ad-cols-2" style={{ marginTop: 22 }}>
        <Payslip staff={me} slip={slip} />
        <div className="ad-card st-noprint">
          <div className="ad-card__head"><h3>Pay structure</h3></div>
          <div className="ad-card__body">
            <div className="ad-kv"><span>Basic (monthly)</span><b>{money(me.salary?.basic)}</b></div>
            <div className="ad-kv"><span>HRA</span><b>{money(me.salary?.hra)}</b></div>
            <div className="ad-kv"><span>Allowances</span><b>{money(me.salary?.allowances)}</b></div>
            <div className="ad-kv"><span>Fixed deductions</span><b>{money(me.salary?.deductions)}</b></div>
            <div className="ad-kv"><span>Overtime rate</span><b>{money(me.salary?.otRate)}/h</b></div>
            <div className="ad-kv"><span>Daily rate (22 working days)</span><b>{money(slip.dailyRate)}</b></div>
            <p className="ad-muted" style={{ fontSize: 12.5, marginTop: 14 }}>
              Payslips are calculated live from approved overtime and approved unpaid leave in the selected month.
              Questions about pay? Raise a concern under <b>Salary / payment</b>.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
