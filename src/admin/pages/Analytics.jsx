import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell,
} from 'recharts'
import { TrendingUp, XCircle, Activity, Clock } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import { useStore } from '../hooks/useStore'
import * as analytics from '../services/analyticsService'

const tip = { background: 'var(--ad-surface)', border: '1px solid var(--ad-border)', borderRadius: 12, fontSize: 13, color: 'var(--ad-text)' }
const axis = { fontSize: 12, fill: 'var(--ad-text-3)', fontWeight: 600 }

export default function Analytics() {
  const [stats] = useStore(() => analytics.overview(), [])
  const weekly = analytics.weekly()
  const peak = analytics.peakHours()
  const perf = analytics.doctorPerformance()
  const status = analytics.statusBreakdown()

  const totalBookings = weekly.reduce((s, d) => s + d.bookings, 0)
  const totalCancel = weekly.reduce((s, d) => s + d.cancelled, 0)
  const rate = Math.round((totalCancel / totalBookings) * 100)

  return (
    <>
      <PageHeader title="Analytics" subtitle="Bookings, cancellations, doctor performance & peak hours" />

      <div className="ad-grid ad-stats" style={{ marginBottom: 18 }}>
        <StatCard index={0} icon={TrendingUp} tone="brand" value={totalBookings} label="Bookings this week" trend="12%" up />
        <StatCard index={1} icon={XCircle} tone="red" value={totalCancel} label="Cancellations" trend={`${rate}% rate`} up={false} />
        <StatCard index={2} icon={Activity} tone="green" value={`${100 - rate}%`} label="Completion rate" trend="2%" up />
        <StatCard index={3} icon={Clock} tone="violet" value="10 AM" label="Busiest hour" trend="peak" up />
      </div>

      <div className="ad-grid ad-cols-2">
        <div className="ad-card">
          <div className="ad-card__head"><div><h3>Bookings vs cancellations</h3><p>Weekly trend</p></div></div>
          <div className="ad-card__body" style={{ paddingTop: 8 }}>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={weekly} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="anA" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4f6cf7" stopOpacity={0.35} /><stop offset="100%" stopColor="#4f6cf7" stopOpacity={0} /></linearGradient>
                  <linearGradient id="anB" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f43f5e" stopOpacity={0.3} /><stop offset="100%" stopColor="#f43f5e" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="var(--ad-border)" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={axis} />
                <YAxis tickLine={false} axisLine={false} tick={axis} width={40} />
                <Tooltip contentStyle={tip} cursor={{ stroke: 'var(--ad-border-2)' }} />
                <Area type="monotone" dataKey="bookings" stroke="#4f6cf7" strokeWidth={2.6} fill="url(#anA)" />
                <Area type="monotone" dataKey="cancelled" stroke="#f43f5e" strokeWidth={2.4} fill="url(#anB)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="ad-card">
          <div className="ad-card__head"><div><h3>Status breakdown</h3><p>All appointments</p></div></div>
          <div className="ad-card__body">
            <div style={{ position: 'relative', height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={status} dataKey="value" innerRadius={58} outerRadius={84} paddingAngle={3} stroke="none">
                    {status.map((s) => <Cell key={s.name} fill={s.color} />)}
                  </Pie>
                  <Tooltip contentStyle={tip} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
              {status.map((s) => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', fontSize: 13 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color, marginRight: 8 }} />
                  <span className="ad-muted">{s.name}</span><b style={{ marginLeft: 'auto' }}>{s.value}</b>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="ad-grid ad-cols-2" style={{ marginTop: 18 }}>
        <div className="ad-card">
          <div className="ad-card__head"><div><h3>Doctor performance</h3><p>Appointments handled</p></div></div>
          <div className="ad-card__body" style={{ paddingTop: 8 }}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={perf} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="var(--ad-border)" horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} tick={axis} />
                <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ ...axis, fontSize: 11.5 }} width={64} />
                <Tooltip contentStyle={tip} cursor={{ fill: 'var(--ad-surface-3)' }} />
                <Bar dataKey="appointments" fill="#4f6cf7" radius={[0, 6, 6, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="ad-card">
          <div className="ad-card__head"><div><h3>Peak hours</h3><p>Patient visits by hour</p></div></div>
          <div className="ad-card__body" style={{ paddingTop: 8 }}>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={peak} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="var(--ad-border)" vertical={false} />
                <XAxis dataKey="hour" tickLine={false} axisLine={false} tick={axis} />
                <YAxis tickLine={false} axisLine={false} tick={axis} width={40} />
                <Tooltip contentStyle={tip} cursor={{ stroke: 'var(--ad-border-2)' }} />
                <Line type="monotone" dataKey="visits" stroke="#10c8a3" strokeWidth={3} dot={{ r: 3, fill: '#10c8a3' }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  )
}
