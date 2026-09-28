import { useNavigate } from 'react-router-dom'
import { CalendarOff, CalendarRange, Clock3, ClipboardCheck, MessageSquareWarning, Users, ArrowRight } from 'lucide-react'
import StatCard from '../../admin/components/StatCard'
import PageHeader from '../../admin/components/PageHeader'
import { Button } from '../../admin/components/ui'
import { useAuth } from '../hooks/useAuth'
import { useStore } from '../../admin/hooks/useStore'
import * as store from '../../services/staffStore'
import { SHIFTS } from '../../data/staff'
import { fmtDate } from '../../admin/utils/format'
import { StatusBadge, ShiftCell, StaffCell, LeaveTypeTag } from '../components/common'

const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function Dashboard() {
  const { user, isManager } = useAuth()
  const navigate = useNavigate()
  const id = user.id

  const [data] = useStore(() => {
    const ws = store.weekStart(store.TODAY)
    const week = Array.from({ length: 7 }, (_, i) => store.addDays(ws, i))
    const myShifts = store.getShifts({ staffId: id, from: ws, to: week[6] })
    const balance = store.leaveBalance(id)
    const leaves = store.getLeaveRequests(id)
    const ot = store.getOvertime(id).filter((o) => o.date.startsWith(store.monthOf(store.TODAY)))
    const shiftReqs = store.getShiftRequests(id)
    return {
      week, myShifts, balance,
      next: store.nextShift(id),
      leaveLeft: balance.filter((b) => b.type !== 'maternity' && b.type !== 'unpaid').reduce((a, b) => a + b.left, 0),
      pendingMine: leaves.filter((l) => l.status === 'pending').length + shiftReqs.filter((r) => r.status === 'pending' && r.fromStaffId === id).length + ot.filter((o) => o.status === 'pending').length,
      otHours: ot.filter((o) => o.status !== 'rejected').reduce((a, o) => a + o.hours, 0),
      recent: [
        ...leaves.map((l) => ({ id: l.id, kind: 'Leave', text: `${l.from} → ${l.to} · ${l.days}d`, status: l.status, at: l.appliedAt, type: l.type })),
        ...ot.map((o) => ({ id: o.id, kind: 'Overtime', text: `${o.date} · ${o.hours}h`, status: o.status, at: o.date })),
        ...shiftReqs.filter((r) => r.fromStaffId === id).map((r) => ({ id: r.id, kind: r.kind === 'swap' ? 'Shift swap' : 'Handover', text: store.getShift(r.shiftId)?.date || '', status: r.status, at: r.createdAt })),
      ].sort((a, b) => (b.at || '').localeCompare(a.at || '')).slice(0, 6),
      concerns: store.getConcerns(isManager ? undefined : id).filter((c) => c.status !== 'resolved').slice(0, 4),
      pending: store.pendingCounts(),
      onLeave: store.onLeaveOn(store.TODAY),
      staffById: Object.fromEntries(store.getStaff().map((s) => [s.id, s])),
    }
  }, [id, isManager])

  const nextMeta = data.next ? SHIFTS[data.next.shift] : null

  return (
    <>
      <PageHeader title={`Hello, ${user.name.replace(/^Dr\.\s*/, '').split(' ')[0]} 👋`} subtitle={`Here is your overview for ${fmtDate(store.TODAY)}.`}>
        <Button variant="ghost" onClick={() => navigate('/staff/roster')}><CalendarRange size={16} /> Roster</Button>
        <Button onClick={() => navigate('/staff/leave')}><CalendarOff size={16} /> Apply for leave</Button>
      </PageHeader>

      <div className="ad-grid ad-stats">
        <StatCard index={0} icon={CalendarOff} tone="brand" value={data.leaveLeft} label="Leave days left this year" />
        <StatCard index={1} icon={CalendarRange} tone="amber" value={data.next ? `${nextMeta.label}` : 'None'} label={data.next ? `Next shift · ${fmtDate(data.next.date)} ${nextMeta.start}–${nextMeta.end}` : 'No upcoming shift'} />
        <StatCard index={2} icon={Clock3} tone="violet" value={`${data.otHours}h`} label="Overtime this month" />
        <StatCard index={3} icon={ClipboardCheck} tone="green" value={data.pendingMine} label="My requests awaiting approval" />
      </div>

      {isManager && (
        <div className="ad-grid ad-stats" style={{ marginTop: 16 }}>
          <StatCard index={4} icon={ClipboardCheck} tone="amber" value={data.pending.leave + data.pending.shifts + data.pending.overtime} label="Approvals waiting for you" />
          <StatCard index={5} icon={MessageSquareWarning} tone="red" value={data.pending.concerns} label="Open concerns" />
          <StatCard index={6} icon={Users} tone="brand" value={data.onLeave.length} label="Staff on leave today" />
          <StatCard index={7} icon={Users} tone="green" value={Object.values(data.staffById).filter((s) => s.active !== false).length} label="Active staff" />
        </div>
      )}

      <div className="ad-card" style={{ marginTop: 22 }}>
        <div className="ad-card__head">
          <h3>This week</h3>
          <button className="ad-btn ad-btn--ghost ad-btn--sm" onClick={() => navigate('/staff/roster')}>Full roster <ArrowRight size={14} /></button>
        </div>
        <div className="ad-card__body">
          <div className="st-week">
            {data.week.map((d, i) => {
              const s = data.myShifts.find((x) => x.date === d)
              return (
                <div key={d} className={`st-day ${d === store.TODAY ? 'today' : ''}`}>
                  <b>{DOW[i]}</b>
                  <span>{Number(d.slice(-2))}</span>
                  <ShiftCell shift={s?.shift} ward={s?.ward} />
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="ad-grid ad-cols-2" style={{ marginTop: 22 }}>
        <div className="ad-card">
          <div className="ad-card__head"><h3>Recent requests</h3></div>
          <div className="ad-card__body">
            {data.recent.length === 0 && <p className="ad-muted">No requests yet.</p>}
            <div className="st-list">
              {data.recent.map((r) => (
                <div className="st-row" key={r.id}>
                  <b>{r.kind}</b>
                  {r.type && <LeaveTypeTag type={r.type} />}
                  <span className="ad-muted">{r.text}</span>
                  <StatusBadge status={r.status} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="ad-card">
          <div className="ad-card__head">
            <h3>{isManager ? 'Open concerns' : 'My open concerns'}</h3>
            <button className="ad-btn ad-btn--ghost ad-btn--sm" onClick={() => navigate('/staff/concerns')}>View all</button>
          </div>
          <div className="ad-card__body">
            {data.concerns.length === 0 && <p className="ad-muted">Nothing open. 🎉</p>}
            <div className="st-list">
              {data.concerns.map((c) => (
                <div className="st-row" key={c.id}>
                  {isManager && <StaffCell staff={data.staffById[c.staffId]} sub={c.category} />}
                  {!isManager && <b>{c.subject}</b>}
                  {isManager && <span className="ad-muted" style={{ flex: 1 }}>{c.subject}</span>}
                  <StatusBadge status={c.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isManager && data.onLeave.length > 0 && (
        <div className="ad-card" style={{ marginTop: 22 }}>
          <div className="ad-card__head"><h3>On leave today</h3></div>
          <div className="ad-card__body">
            <div className="st-list">
              {data.onLeave.map((s) => <div className="st-row" key={s.id}><StaffCell staff={s} /></div>)}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
