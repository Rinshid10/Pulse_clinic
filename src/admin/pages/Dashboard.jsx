import { useNavigate } from 'react-router-dom'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts'
import { CalendarDays, Stethoscope, Users, Clock3, XCircle, DollarSign, ArrowRight, Plane } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import { Avatar, Badge, Button } from '../components/ui'
import { useStore } from '../hooks/useStore'
import * as analytics from '../services/analyticsService'
import { listAppointments } from '../services/appointmentService'
import { getDoctor, getLeaves, TODAY } from '../../services/clinicStore'
import { billingSummary } from '../../services/billingStore'
import { STATUS_BADGE } from '../utils/constants'
import { money, to12h } from '../utils/format'

const chartTip = { background: 'var(--ad-surface)', border: '1px solid var(--ad-border)', borderRadius: 12, fontSize: 13, color: 'var(--ad-text)' }

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats] = useStore(() => analytics.overview(), [])
  const [appts] = useStore(() => listAppointments(), [])
  const [leaves] = useStore(() => getLeaves(), [])
  const [billing] = useStore(() => billingSummary(), [])
  const weekly = analytics.weekly()
  const status = analytics.statusBreakdown()

  const today = appts.filter((a) => a.date === TODAY).sort((a, b) => a.time.localeCompare(b.time))
  const onLeave = Object.entries(leaves).filter(([, l]) => l.date === TODAY)

  return (
    <>
      <PageHeader title="Good morning, Dr. Hart 👋" subtitle="Here's your clinic at a glance — Monday, 29 June 2026.">
        <Button onClick={() => navigate('/admin/appointments')}>
          <CalendarDays size={16} /> View appointments
        </Button>
      </PageHeader>

      <div className="ad-grid ad-stats" style={{ marginBottom: 16 }}>
        <StatCard index={0} icon={CalendarDays} tone="brand" value={stats.todayCount} label="Appointments today" trend="12%" up />
        <StatCard index={1} icon={Stethoscope} tone="green" value={stats.activeDoctors} label="Active doctors" trend={`${stats.totalDoctors} total`} up />
        <StatCard index={2} icon={Users} tone="violet" value={stats.totalPatients} label="Total patients" trend="6%" up />
        <StatCard index={3} icon={DollarSign} tone="amber" value={money(billing.combinedToday)} label="Collected today (clinic + pharmacy)" trend={`${billing.todayCount} bills · pharmacy ${money(billing.pharmacyToday)}`} up />
      </div>
      <div className="ad-grid ad-stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 18 }}>
        <StatCard index={0} icon={Clock3} tone="amber" value={stats.pending} label="Pending bookings" trend="needs review" up={false} />
        <StatCard index={1} icon={XCircle} tone="red" value={stats.cancelled} label="Cancelled" trend="3%" up={false} />
        <StatCard index={2} icon={Plane} tone="violet" value={stats.onLeave} label="Doctors on leave today" trend="today" up />
      </div>

      <div className="ad-grid ad-cols-2">
        <div className="ad-card">
          <div className="ad-card__head">
            <div><h3>Bookings this week</h3><p>Total vs. cancelled</p></div>
            <Badge kind="blue">285 total</Badge>
          </div>
          <div className="ad-card__body" style={{ paddingTop: 8 }}>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={weekly} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="adA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f6cf7" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#4f6cf7" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="adB" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="var(--ad-border)" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'var(--ad-text-3)', fontWeight: 600 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'var(--ad-text-3)' }} width={40} />
                <Tooltip contentStyle={chartTip} cursor={{ stroke: 'var(--ad-border-2)' }} />
                <Area type="monotone" dataKey="bookings" stroke="#4f6cf7" strokeWidth={2.6} fill="url(#adA)" name="Bookings" />
                <Area type="monotone" dataKey="cancelled" stroke="#f43f5e" strokeWidth={2.4} fill="url(#adB)" name="Cancelled" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="ad-card">
          <div className="ad-card__head"><div><h3>Appointment status</h3><p>All bookings</p></div></div>
          <div className="ad-card__body">
            <div style={{ position: 'relative', height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={status} dataKey="value" innerRadius={56} outerRadius={82} paddingAngle={3} stroke="none">
                    {status.map((s) => <Cell key={s.name} fill={s.color} />)}
                  </Pie>
                  <Tooltip contentStyle={chartTip} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', inset: 0, display: 'grid', placeContent: 'center', textAlign: 'center', pointerEvents: 'none' }}>
                <div style={{ fontSize: 24, fontWeight: 800 }}>{appts.length}</div>
                <div style={{ fontSize: 11, color: 'var(--ad-text-3)', fontWeight: 700, textTransform: 'uppercase' }}>Total</div>
              </div>
            </div>
            <div style={{ display: 'grid', gap: 9, marginTop: 14 }}>
              {status.map((s) => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', fontSize: 13 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color, marginRight: 9 }} />
                  <span style={{ color: 'var(--ad-text-2)' }}>{s.name}</span>
                  <b style={{ marginLeft: 'auto' }}>{s.value}</b>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="ad-grid ad-cols-2" style={{ marginTop: 18 }}>
        <div className="ad-card">
          <div className="ad-card__head">
            <div><h3>Today's schedule</h3><p>{today.length} appointments</p></div>
            <Button variant="ghost" sm onClick={() => navigate('/admin/appointments')}>View all <ArrowRight size={15} /></Button>
          </div>
          <div className="ad-tablewrap">
            <table className="ad-table">
              <thead><tr><th>Patient</th><th>Doctor</th><th>Time</th><th>Status</th></tr></thead>
              <tbody>
                {today.slice(0, 6).map((a) => {
                  const d = getDoctor(a.doctorId)
                  const st = STATUS_BADGE[a.status]
                  return (
                    <tr key={a.id}>
                      <td><div className="ad-cell-user"><Avatar name={a.patient} size="sm" /><div><b>{a.patient}</b><br /><small>{a.reason}</small></div></div></td>
                      <td><span className="ad-muted">{d?.name?.replace('Dr. ', '') || '—'}</span></td>
                      <td><b>{to12h(a.time)}</b></td>
                      <td><Badge kind={st.kind}>{st.label}</Badge></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="ad-card">
          <div className="ad-card__head">
            <div><h3>On leave today</h3><p>{onLeave.length} doctor{onLeave.length === 1 ? '' : 's'}</p></div>
            <Button variant="ghost" sm onClick={() => navigate('/admin/availability')}>Manage <ArrowRight size={15} /></Button>
          </div>
          <div className="ad-card__body" style={{ paddingTop: 10 }}>
            {onLeave.length === 0 ? (
              <p className="ad-muted" style={{ fontSize: 14, padding: '20px 0', textAlign: 'center' }}>All doctors are available today 🎉</p>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {onLeave.map(([id, l]) => {
                  const d = getDoctor(id)
                  if (!d) return null
                  return (
                    <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                      <Avatar name={d.name} color={d.color} size="sm" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <b style={{ fontSize: 13.5 }}>{d.name}</b>
                        <div className="ad-muted" style={{ fontSize: 12 }}>{l.reason || 'No reason given'}</div>
                      </div>
                      <Badge kind={l.type === 'full' ? 'red' : 'amber'}>{l.type === 'full' ? 'Full day' : `Half (${l.half})`}</Badge>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
