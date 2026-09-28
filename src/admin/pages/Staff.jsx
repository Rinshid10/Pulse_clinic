import { useMemo, useState } from 'react'
import { Search, Eye, Clock3, Wallet, CalendarOff, MessageSquareWarning, Users, ExternalLink, Phone, Mail, Send } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import StatCard from '../components/StatCard'
import { Avatar, Badge, Button } from '../components/ui'
import { useStore } from '../hooks/useStore'
import { useToast } from '../hooks/useToast'
import { useAuth } from '../hooks/useAuth'
import * as st from '../../services/staffStore'
import { LEAVE_TYPES, SHIFTS, STAFF_ROLES, REQUEST_STATUS, CONCERN_STATUS } from '../../data/staff'
import { money, fmtDate } from '../utils/format'

const statusBadge = (s) => { const m = REQUEST_STATUS[s] || CONCERN_STATUS[s] || { label: s, kind: 'gray' }; return <Badge kind={m.kind}>{m.label}</Badge> }
const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function Staff() {
  const toast = useToast()
  const { user } = useAuth()
  const [staff] = useStore(() => st.getStaff(), [])
  const [rows] = useStore(() => st.getStaff().map((s) => ({
    ...s, time: st.timeSummary(s.id), slip: st.payslip(s.id), balance: st.leaveBalance(s.id),
    pendingLeave: st.getLeaveRequests(s.id).filter((l) => l.status === 'pending').length,
    openConcerns: st.getConcerns(s.id).filter((c) => c.status !== 'resolved').length,
  })), [])
  const [pending] = useStore(() => st.pendingCounts(), [])
  const [q, setQ] = useState('')
  const [dept, setDept] = useState('all')
  const [view, setView] = useState(null)
  const [tab, setTab] = useState('overview')
  const [reply, setReply] = useState('')

  const list = useMemo(() => rows
    .filter((s) => dept === 'all' || s.dept === dept)
    .filter((s) => !q || `${s.name} ${s.empId} ${s.designation} ${s.email}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => a.dept.localeCompare(b.dept) || a.name.localeCompare(b.name)), [rows, q, dept])

  const active = rows.filter((s) => s.active !== false)
  const totals = {
    payroll: active.reduce((a, s) => a + (s.slip?.net || 0), 0),
    hoursMonth: active.reduce((a, s) => a + s.time.hoursMonth, 0),
    onLeave: rows.filter((s) => s.time.onLeaveToday).length,
    concerns: pending.concerns,
  }

  // live detail for the open modal
  const detail = view ? rows.find((s) => s.id === view) : null
  const [leaves] = useStore(() => (view ? st.getLeaveRequests(view).sort((a, b) => b.from.localeCompare(a.from)) : []), [view])
  const [overtime] = useStore(() => (view ? st.getOvertime(view).sort((a, b) => b.date.localeCompare(a.date)) : []), [view])
  const [concerns] = useStore(() => (view ? st.getConcerns(view).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) : []), [view])
  const [week] = useStore(() => {
    if (!view) return []
    const ws = st.weekStart(st.TODAY)
    return Array.from({ length: 7 }, (_, i) => { const d = st.addDays(ws, i); return { d, shift: st.getShifts({ staffId: view, from: d, to: d })[0] } })
  }, [view])
  const [activeConcern, setActiveConcern] = useState(null)
  const concern = concerns.find((c) => c.id === activeConcern) || concerns[0] || null

  const sendReply = () => {
    if (!reply.trim() || !concern) return
    st.replyConcern(concern.id, user?.name || 'Admin', reply.trim())
    if (concern.status === 'open') st.setConcernStatus(concern.id, 'in-progress')
    setReply('')
    toast('Reply sent', concern.subject)
  }

  const columns = [
    { key: 'name', header: 'Staff', render: (s) => (
      <div className="ad-cell-user">
        <Avatar name={s.name} color={s.color} size="sm" />
        <div><b>{s.name}</b><small>{s.designation} · {s.dept} · {s.empId}</small></div>
      </div>
    ) },
    { key: 'role', header: 'Role', render: (s) => <Badge kind={s.role === 'staff' ? 'gray' : 'blue'}>{STAFF_ROLES[s.role]}</Badge> },
    { key: 'today', header: 'Today', render: (s) => s.time.onLeaveToday ? <Badge kind="amber">On leave</Badge> : s.time.today ? <span className="ad-tag" style={{ color: SHIFTS[s.time.today.shift]?.color }}>{SHIFTS[s.time.today.shift]?.label} · {s.time.today.ward}</span> : <span className="ad-muted">Off</span> },
    { key: 'hours', header: 'Time in clinic', render: (s) => <><b>{s.time.hoursMonth}h</b> this month<br /><small className="ad-muted">{s.time.shiftsMonth} shifts · {s.time.otMonth}h OT · {s.time.hoursAll}h total</small></> },
    { key: 'salary', header: 'Salary', render: (s) => <><b>{money(s.slip?.net)}</b> net<br /><small className="ad-muted">basic {money(s.salary?.basic)} · OT {money(s.salary?.otRate)}/h</small></> },
    { key: 'leave', header: 'Leave left', render: (s) => <>{s.balance.find((b) => b.type === 'annual')?.left} annual · {s.balance.find((b) => b.type === 'sick')?.left} sick{s.pendingLeave > 0 && <><br /><Badge kind="amber">{s.pendingLeave} pending</Badge></>}</> },
    { key: 'concerns', header: 'Concerns', render: (s) => s.openConcerns > 0 ? <Badge kind="red">{s.openConcerns} open</Badge> : <span className="ad-muted">None</span> },
    { key: 'status', header: 'Status', render: (s) => <Badge kind={s.active === false ? 'red' : 'green'}>{s.active === false ? 'Inactive' : 'Active'}</Badge> },
    { key: 'act', header: '', width: 60, render: (s) => <div className="ad-rowact"><button className="go" title="View details" onClick={() => { setView(s.id); setTab('overview'); setActiveConcern(null) }}><Eye size={16} /></button></div> },
  ]

  return (
    <>
      <PageHeader title="Staff" subtitle="Everything about your team: salary, time in the clinic, leave, overtime and concerns.">
        <a className="ad-btn ad-btn--ghost" href="/staff" target="_blank" rel="noreferrer"><ExternalLink size={16} /> Staff portal</a>
        <a className="ad-btn ad-btn--primary" href="/hr" target="_blank" rel="noreferrer"><ExternalLink size={16} /> Open HR console</a>
      </PageHeader>

      <div className="ad-grid ad-stats" style={{ marginBottom: 18 }}>
        <StatCard index={0} icon={Users} tone="brand" value={active.length} label="Active staff" trend={`${rows.length - active.length} inactive`} up />
        <StatCard index={1} icon={Clock3} tone="violet" value={`${totals.hoursMonth}h`} label="Hours in clinic this month" trend={`${totals.onLeave} on leave today`} up />
        <StatCard index={2} icon={Wallet} tone="green" value={money(totals.payroll)} label="Payroll this month (net)" />
        <StatCard index={3} icon={MessageSquareWarning} tone={totals.concerns ? 'red' : 'amber'} value={totals.concerns} label="Open concerns" trend={`${pending.leave + pending.shifts + pending.overtime} requests pending`} up={false} />
      </div>

      <div className="ad-toolbar">
        <div className="ad-search"><Search size={16} /><input placeholder="Search name, ID, designation…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div className="ad-chips">
          {['all', ...new Set(staff.map((s) => s.dept))].map((d) => <button key={d} className={`ad-chip ${dept === d ? 'active' : ''}`} onClick={() => setDept(d)}>{d}</button>)}
        </div>
      </div>

      <DataTable columns={columns} rows={list} empty="No staff match." />

      <Modal open={!!detail} onClose={() => setView(null)} title={detail?.name} subtitle={detail && `${detail.designation} · ${detail.dept} · ${detail.empId} · joined ${fmtDate(detail.joinDate)}`} width={760}>
        {detail && (
          <div>
            <div className="ad-seg" style={{ marginBottom: 16 }}>
              {[['overview', 'Overview'], ['salary', 'Salary'], ['time', 'Time & roster'], ['leave', 'Leave'], ['concerns', `Concerns${detail.openConcerns ? ` (${detail.openConcerns})` : ''}`]].map(([k, l]) => (
                <button key={k} className={tab === k ? 'active' : ''} onClick={() => setTab(k)}>{l}</button>
              ))}
            </div>

            {tab === 'overview' && (
              <div className="ad-grid ad-cols-2" style={{ gap: 18 }}>
                <div>
                  <h4 className="ad-muted" style={{ fontSize: 12, textTransform: 'uppercase', marginBottom: 6 }}>Contact</h4>
                  <div className="ad-kv"><span><Mail size={13} /> Email</span><b>{detail.email}</b></div>
                  <div className="ad-kv"><span><Phone size={13} /> Phone</span><b>{detail.phone || '—'}</b></div>
                  <div className="ad-kv"><span>Address</span><b style={{ textAlign: 'right' }}>{detail.address || '—'}</b></div>
                  <div className="ad-kv"><span>Emergency</span><b>{detail.emergency?.name ? `${detail.emergency.name} (${detail.emergency.relation}) · ${detail.emergency.phone}` : '—'}</b></div>
                  <h4 className="ad-muted" style={{ fontSize: 12, textTransform: 'uppercase', margin: '14px 0 6px' }}>Health</h4>
                  <div className="ad-kv"><span>Height / weight</span><b>{detail.health?.heightCm || '—'} cm · {detail.health?.weightKg || '—'} kg</b></div>
                  <div className="ad-kv"><span>Blood group</span><b>{detail.health?.bloodGroup || '—'}</b></div>
                  <div className="ad-kv"><span>Allergies / conditions</span><b>{detail.health?.allergies || '—'} · {detail.health?.conditions || '—'}</b></div>
                </div>
                <div>
                  <h4 className="ad-muted" style={{ fontSize: 12, textTransform: 'uppercase', marginBottom: 6 }}>This month</h4>
                  <div className="ad-kv"><span>Time in clinic</span><b>{detail.time.hoursMonth}h ({detail.time.shiftsMonth} shifts + {detail.time.otMonth}h OT)</b></div>
                  <div className="ad-kv"><span>Net salary</span><b>{money(detail.slip?.net)}</b></div>
                  <div className="ad-kv"><span>Today</span><b>{detail.time.onLeaveToday ? 'On leave' : detail.time.today ? `${SHIFTS[detail.time.today.shift]?.label} · ${detail.time.today.ward}` : 'Off'}</b></div>
                  <div className="ad-kv"><span>Pending requests</span><b>{detail.pendingLeave} leave · {overtime.filter((o) => o.status === 'pending').length} overtime</b></div>
                  <div className="ad-kv"><span>Open concerns</span><b>{detail.openConcerns}</b></div>
                  <h4 className="ad-muted" style={{ fontSize: 12, textTransform: 'uppercase', margin: '14px 0 6px' }}>All time</h4>
                  <div className="ad-kv"><span>Days worked (rostered)</span><b>{detail.time.daysWorked}</b></div>
                  <div className="ad-kv"><span>Hours in clinic</span><b>{detail.time.hoursAll}h</b></div>
                  <div className="ad-kv"><span>Approved overtime</span><b>{detail.time.otAll}h</b></div>
                </div>
              </div>
            )}

            {tab === 'salary' && detail.slip && (
              <div className="ad-grid ad-cols-2" style={{ gap: 18 }}>
                <div>
                  <h4 className="ad-muted" style={{ fontSize: 12, textTransform: 'uppercase', marginBottom: 6 }}>Structure (monthly)</h4>
                  <div className="ad-kv"><span>Basic</span><b>{money(detail.salary?.basic)}</b></div>
                  <div className="ad-kv"><span>HRA</span><b>{money(detail.salary?.hra)}</b></div>
                  <div className="ad-kv"><span>Allowances</span><b>{money(detail.salary?.allowances)}</b></div>
                  <div className="ad-kv"><span>Fixed deductions</span><b>{money(detail.salary?.deductions)}</b></div>
                  <div className="ad-kv"><span>Overtime rate</span><b>{money(detail.salary?.otRate)}/h</b></div>
                </div>
                <div>
                  <h4 className="ad-muted" style={{ fontSize: 12, textTransform: 'uppercase', marginBottom: 6 }}>Payslip · this month</h4>
                  <div className="ad-kv"><span>Overtime ({detail.slip.otHours}h)</span><b>{money(detail.slip.otAmount)}</b></div>
                  <div className="ad-kv"><span>Gross</span><b>{money(detail.slip.gross)}</b></div>
                  <div className="ad-kv"><span>Unpaid leave ({detail.slip.unpaidDays}d)</span><b>- {money(detail.slip.unpaidDeduction)}</b></div>
                  <div className="ad-kv"><span>Total deductions</span><b>- {money(detail.slip.totalDeductions)}</b></div>
                  <div className="ad-kv" style={{ fontSize: 16 }}><span><b>Net pay</b></span><b>{money(detail.slip.net)}</b></div>
                </div>
              </div>
            )}

            {tab === 'time' && (
              <div>
                <div className="ad-grid ad-stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 16 }}>
                  <div className="ad-card ad-stat"><div className="ad-stat__value">{detail.time.hoursMonth}h</div><div className="ad-stat__label">This month in clinic</div></div>
                  <div className="ad-card ad-stat"><div className="ad-stat__value">{detail.time.daysWorked}</div><div className="ad-stat__label">Days worked (all time)</div></div>
                  <div className="ad-card ad-stat"><div className="ad-stat__value">{detail.time.otAll}h</div><div className="ad-stat__label">Approved overtime</div></div>
                </div>
                <h4 className="ad-muted" style={{ fontSize: 12, textTransform: 'uppercase', marginBottom: 8 }}>This week's roster</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 16 }}>
                  {week.map(({ d, shift }, i) => {
                    const m = SHIFTS[shift?.shift]
                    return (
                      <div key={d} style={{ textAlign: 'center', padding: '8px 4px', borderRadius: 10, border: `1px solid ${d === st.TODAY ? 'var(--ad-brand)' : 'var(--ad-border)'}`, background: 'var(--ad-surface-2)' }}>
                        <div style={{ fontSize: 11, color: 'var(--ad-text-3)', fontWeight: 700 }}>{DOW[i]} {Number(d.slice(-2))}</div>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: m?.color || 'var(--ad-text-3)', marginTop: 4 }}>{m?.label || '—'}</div>
                        {shift && shift.shift !== 'off' && <div style={{ fontSize: 11, color: 'var(--ad-text-3)' }}>{shift.ward}</div>}
                      </div>
                    )
                  })}
                </div>
                <h4 className="ad-muted" style={{ fontSize: 12, textTransform: 'uppercase', marginBottom: 6 }}>Overtime log</h4>
                {overtime.length === 0 && <p className="ad-muted">No overtime logged.</p>}
                {overtime.map((o) => <div className="ad-kv" key={o.id}><span>{fmtDate(o.date)} · {o.hours}h · {o.reason}</span><b>{money(o.amount)} {statusBadge(o.status)}</b></div>)}
              </div>
            )}

            {tab === 'leave' && (
              <div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                  {detail.balance.filter((b) => b.quota > 0).map((b) => <span key={b.type} className="ad-tag" style={{ color: b.color }}>{b.label}: {b.left}/{b.quota} left</span>)}
                </div>
                {leaves.length === 0 && <p className="ad-muted">No leave requests.</p>}
                {leaves.map((l) => (
                  <div className="ad-kv" key={l.id}>
                    <span><b style={{ color: LEAVE_TYPES[l.type]?.color }}>{LEAVE_TYPES[l.type]?.label}</b> · {fmtDate(l.from)} → {fmtDate(l.to)} · {l.days}d<br /><small className="ad-muted">{l.reason}{l.note ? ` — ${l.note}` : ''}</small></span>
                    <b>{statusBadge(l.status)}</b>
                  </div>
                ))}
              </div>
            )}

            {tab === 'concerns' && (
              <div>
                {concerns.length === 0 && <p className="ad-muted">No concerns raised.</p>}
                {concerns.length > 0 && (
                  <div className="ad-grid" style={{ gridTemplateColumns: '1fr 1.4fr', gap: 14 }}>
                    <div style={{ display: 'grid', gap: 6, alignContent: 'start' }}>
                      {concerns.map((c) => (
                        <button key={c.id} type="button" onClick={() => setActiveConcern(c.id)} style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 10, border: `1px solid ${concern?.id === c.id ? 'var(--ad-brand)' : 'var(--ad-border)'}`, background: 'var(--ad-surface-2)', font: 'inherit', color: 'inherit' }}>
                          <b style={{ fontSize: 13 }}>{c.subject}</b><br /><small className="ad-muted">{c.category} · {fmtDate(c.createdAt)}</small><br /><span style={{ display: 'inline-block', marginTop: 4 }}>{statusBadge(c.status)}</span>
                        </button>
                      ))}
                    </div>
                    {concern && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                          <b>{concern.subject}</b>
                          <select value={concern.status} onChange={(e) => { st.setConcernStatus(concern.id, e.target.value); toast('Status updated', CONCERN_STATUS[e.target.value].label, 'info') }} className="ad-select">
                            {Object.entries(CONCERN_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                          </select>
                        </div>
                        <div className="ad-hist" style={{ display: 'block', marginBottom: 8 }}><small className="ad-muted">{detail.name} · {fmtDate(concern.createdAt)}</small><br />{concern.body}</div>
                        {(concern.replies || []).map((r, i) => <div key={i} className="ad-hist" style={{ display: 'block', marginBottom: 8, background: 'var(--ad-brand-soft)' }}><small className="ad-muted">{r.by} · {fmtDate(r.at)}</small><br />{r.text}</div>)}
                        {concern.status !== 'resolved' && (
                          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                            <input value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendReply()} placeholder="Reply to the staff member…" className="ad-select" style={{ flex: 1, fontWeight: 500 }} />
                            <Button onClick={sendReply}><Send size={15} /> Send</Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  )
}
