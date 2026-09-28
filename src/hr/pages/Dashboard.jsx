import { useNavigate } from 'react-router-dom'
import { Users, ClipboardCheck, MessageSquareWarning, Banknote, Clock3, CalendarOff, ArrowRight, UserPlus, Megaphone } from 'lucide-react'
import PageHeader from '../../admin/components/PageHeader'
import StatCard from '../../admin/components/StatCard'
import { Badge, Button } from '../../admin/components/ui'
import { useStore } from '../../admin/hooks/useStore'
import { useAuth } from '../hooks/useAuth'
import * as store from '../../services/staffStore'
import { LEAVE_TYPES } from '../../data/staff'
import { money, fmtDate } from '../../admin/utils/format'
import { StaffCell, StatusBadge, LeaveTypeTag } from '../../components/staff-common'
import { EMPLOYMENT_STATUS } from '../utils/constants'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, isHr } = useAuth()
  const [d] = useStore(() => {
    const staff = store.getStaff()
    const active = staff.filter((s) => s.active !== false)
    const byId = Object.fromEntries(staff.map((s) => [s.id, s]))
    const pending = store.pendingCounts()
    const att = store.attendance()
    const upcoming = store.getLeaveRequests().filter((l) => l.status === 'approved' && l.to >= store.TODAY).sort((a, b) => a.from.localeCompare(b.from)).slice(0, 6)
    const pendingLeave = store.getLeaveRequests().filter((l) => l.status === 'pending').sort((a, b) => a.appliedAt.localeCompare(b.appliedAt)).slice(0, 5)
    const lowBalance = active.map((s) => ({ s, b: store.leaveBalance(s.id).find((x) => x.type === 'annual') })).filter((x) => x.b && x.b.left <= 5)
    const joiners = [...active].sort((a, b) => b.joinDate.localeCompare(a.joinDate)).slice(0, 3)
    const run = store.getPayrollRun(store.monthOf(store.TODAY))
    return {
      active: active.length, total: staff.length, byId, pending,
      onLeave: store.onLeaveOn(store.TODAY),
      hours: att.reduce((a, r) => a + r.hours, 0),
      payroll: active.reduce((a, s) => a + (store.payslip(s.id)?.net || 0), 0), run,
      upcoming, pendingLeave, lowBalance, joiners,
      probation: active.filter((s) => s.status === 'probation').length,
      announcements: store.getAnnouncements().slice(0, 3),
    }
  }, [])

  return (
    <>
      <PageHeader title={`Hello, ${user.name.split(' ')[0]} 👋`} subtitle={`Team overview for ${fmtDate(store.TODAY)}.`}>
        <Button variant="ghost" onClick={() => navigate('/hr/roster')}>Roster</Button>
        <Button onClick={() => navigate('/hr/approvals')}><ClipboardCheck size={16} /> Approvals{(d.pending.leave + d.pending.shifts + d.pending.overtime) > 0 && ` (${d.pending.leave + d.pending.shifts + d.pending.overtime})`}</Button>
      </PageHeader>

      <div className="ad-grid ad-stats">
        <StatCard index={0} icon={Users} tone="brand" value={d.active} label="Active employees" trend={`${d.probation} on probation`} up />
        <StatCard index={1} icon={CalendarOff} tone="amber" value={d.onLeave.length} label="On leave today" trend={`${d.pending.leave} leave requests pending`} up={false} />
        <StatCard index={2} icon={Clock3} tone="violet" value={`${d.hours}h`} label="Hours in clinic this month" />
        <StatCard index={3} icon={Banknote} tone="green" value={money(d.payroll)} label={`Payroll this month${d.run ? ' · paid' : ' · not run yet'}`} trend={d.run ? `paid ${fmtDate(d.run.paidAt)}` : isHr ? 'run it from Payroll' : ''} up={!!d.run} />
      </div>

      <div className="ad-grid ad-cols-2" style={{ marginTop: 22 }}>
        <div style={{ display: 'grid', gap: 22, alignContent: 'start' }}>
          <div className="ad-card">
            <div className="ad-card__head"><h3>Waiting for approval</h3><button className="ad-btn ad-btn--ghost ad-btn--sm" onClick={() => navigate('/hr/approvals')}>All approvals <ArrowRight size={14} /></button></div>
            <div className="ad-card__body st-list">
              {d.pendingLeave.length === 0 && <p className="ad-muted">No leave requests waiting. 🎉</p>}
              {d.pendingLeave.map((l) => (
                <div className="st-row" key={l.id}>
                  <StaffCell staff={d.byId[l.staffId]} sub={`${fmtDate(l.from)} → ${fmtDate(l.to)} · ${l.days}d`} />
                  <LeaveTypeTag type={l.type} />
                  <StatusBadge status={l.status} />
                </div>
              ))}
              {(d.pending.shifts > 0 || d.pending.overtime > 0) && <p className="ad-muted" style={{ fontSize: 12.5 }}>Also pending: {d.pending.shifts} shift change{d.pending.shifts === 1 ? '' : 's'} · {d.pending.overtime} overtime entr{d.pending.overtime === 1 ? 'y' : 'ies'}</p>}
            </div>
          </div>

          <div className="ad-card">
            <div className="ad-card__head"><h3>Upcoming & current leave</h3></div>
            <div className="ad-card__body st-list">
              {d.upcoming.length === 0 && <p className="ad-muted">Nobody is scheduled to be away.</p>}
              {d.upcoming.map((l) => (
                <div className="st-row" key={l.id}>
                  <StaffCell staff={d.byId[l.staffId]} sub={`${fmtDate(l.from)} → ${fmtDate(l.to)} · back ${fmtDate(store.returnDate(l.to))}`} />
                  <span className="ad-tag" style={{ color: LEAVE_TYPES[l.type]?.color }}>{LEAVE_TYPES[l.type]?.label}</span>
                  {l.from <= store.TODAY && <Badge kind="amber">Away now</Badge>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 22, alignContent: 'start' }}>
          <div className="ad-card">
            <div className="ad-card__head"><h3><MessageSquareWarning size={15} style={{ verticalAlign: -2 }} /> Open concerns</h3><button className="ad-btn ad-btn--ghost ad-btn--sm" onClick={() => navigate('/hr/concerns')}>Inbox {d.pending.concerns > 0 && `(${d.pending.concerns})`}</button></div>
            <div className="ad-card__body st-list">
              {store.getConcerns().filter((c) => c.status !== 'resolved').slice(0, 4).map((c) => (
                <div className="st-row" key={c.id}><StaffCell staff={d.byId[c.staffId]} sub={c.category} /><span className="ad-muted" style={{ flex: 1 }}>{c.subject}</span><StatusBadge status={c.status} /></div>
              ))}
              {d.pending.concerns === 0 && <p className="ad-muted">Nothing open.</p>}
            </div>
          </div>

          <div className="ad-card">
            <div className="ad-card__head"><h3>Needs attention</h3></div>
            <div className="ad-card__body st-list">
              {d.lowBalance.map(({ s, b }) => <div className="st-row" key={s.id}><StaffCell staff={s} sub="Low annual leave balance" /><Badge kind="amber">{b.left} day{b.left === 1 ? '' : 's'} left</Badge></div>)}
              {d.joiners.map((s) => <div className="st-row" key={s.id}><StaffCell staff={s} sub={`Joined ${fmtDate(s.joinDate)}`} /><Badge kind={EMPLOYMENT_STATUS[s.status]?.kind || 'gray'}>{EMPLOYMENT_STATUS[s.status]?.label || 'Status not set'}</Badge><UserPlus size={15} className="ad-muted" /></div>)}
            </div>
          </div>

          <div className="ad-card">
            <div className="ad-card__head"><h3><Megaphone size={15} style={{ verticalAlign: -2 }} /> Latest announcements</h3><button className="ad-btn ad-btn--ghost ad-btn--sm" onClick={() => navigate('/hr/announcements')}>Manage</button></div>
            <div className="ad-card__body st-list">
              {d.announcements.map((a) => <div className="st-row" key={a.id}><div><b>{a.title}</b><br /><small className="ad-muted">{a.audience === 'all' ? 'Everyone' : a.audience} · {fmtDate(a.date)}</small></div></div>)}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
