import { useNavigate } from 'react-router-dom'
import { DollarSign, Receipt, BadgeCheck } from 'lucide-react'
import PageHeader from '../../admin/components/PageHeader'
import StatCard from '../../admin/components/StatCard'
import { Avatar, Badge, Button } from '../../admin/components/ui'
import { useStore } from '../../admin/hooks/useStore'
import { useAuth } from '../hooks/useAuth'
import * as store from '../../services/billingStore'
import { money, fmtDate, to12h } from '../../admin/utils/format'

export default function Overview() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [summary] = useStore(() => store.billingSummary(), [])
  const [recent] = useStore(() => [
    ...store.getBills().map((b) => ({ id: b.id, kind: 'Consultation', no: b.no, name: b.patient.name, sub: store.getDoctor(b.doctorId)?.name, total: b.total, date: b.date, time: b.time, free: b.type === 'follow-up' })),
  ].sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time)).slice(0, 8), [])
  const [patients] = useStore(() => store.knownPatients(), [])
  const activeFree = patients.filter((p) => store.activeValidity(p.name, null))

  return (
    <>
      <PageHeader title={`Hello, ${user.name.split(' ')[0]} 👋`} subtitle={`Consultation collections for ${fmtDate(store.TODAY)}.`}>
        <Button onClick={() => navigate('/billing/new')}><Receipt size={16} /> New consultation bill</Button>
      </PageHeader>

      <div className="ad-grid ad-stats" style={{ marginBottom: 18 }}>
        <StatCard index={0} icon={DollarSign} tone="brand" value={money(summary.today)} label={`Collected today · ${summary.todayCount} bill${summary.todayCount === 1 ? '' : 's'}`} trend={`${summary.todayFollowUps} free follow-up${summary.todayFollowUps === 1 ? '' : 's'}`} up />
        <StatCard index={1} icon={Receipt} tone="green" value={money(summary.month)} label="This month" trend={`week ${money(summary.week)}`} up />
        <StatCard index={2} icon={BadgeCheck} tone="violet" value={activeFree.length} label="Patients with a free visit open" trend={`${store.VALIDITY_DAYS}-day validity`} up />
        <StatCard index={3} icon={DollarSign} tone="amber" value={money(summary.all)} label="All-time collections" trend={`${summary.count} bills · ${patients.length} patients`} up />
      </div>

      <div className="ad-grid ad-cols-2">
        <div className="ad-card">
          <div className="ad-card__head"><h3>Recent bills</h3></div>
          <div className="ad-card__body" style={{ display: 'grid', gap: 8 }}>
            {recent.map((r) => (
              <div key={r.id} className="ad-hist">
                <div className="ad-cell-user">
                  <Avatar name={r.name} color="#4f6cf7" size="sm" />
                  <div><b>{r.name}</b><small>{r.no} · {r.sub} · {fmtDate(r.date)} {to12h(r.time)}</small></div>
                </div>
                <div style={{ textAlign: 'right' }}><b>{money(r.total)}</b><br />{r.free ? <Badge kind="violet">Free follow-up</Badge> : <Badge kind="blue">Consultation</Badge>}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gap: 18, alignContent: 'start' }}>
          <div className="ad-card">
            <div className="ad-card__head"><h3>Today by doctor</h3><span className="ad-muted" style={{ fontSize: 12.5 }}>{Object.entries(summary.byMethod).map(([m, v]) => `${m} ${money(v)}`).join(' · ')}</span></div>
            <div className="ad-card__body" style={{ display: 'grid', gap: 8 }}>
              {summary.byDoctor.length === 0 && <p className="ad-muted">No consultation bills yet today.</p>}
              {summary.byDoctor.map(({ doctor, total }) => (
                <div key={doctor?.id} className="ad-hist">
                  <div className="ad-cell-user"><Avatar name={doctor?.name || '?'} color={doctor?.color} size="sm" /><div><b>{doctor?.name}</b><small>{doctor?.specialty}</small></div></div>
                  <b>{money(total)}</b>
                </div>
              ))}
            </div>
          </div>

          <div className="ad-card">
            <div className="ad-card__head"><h3>Free follow-ups still valid</h3></div>
            <div className="ad-card__body" style={{ display: 'grid', gap: 8 }}>
              {activeFree.length === 0 && <p className="ad-muted">No patient currently has a free visit open.</p>}
              {activeFree.slice(0, 6).map((p) => { const v = store.activeValidity(p.name, null); return (
                <div key={p.name} className="ad-hist"><div><b>{p.name}</b><br /><small className="ad-muted">{store.getDoctor(v.doctorId)?.name} · paid {fmtDate(v.date)}</small></div><Badge kind="green">until {fmtDate(store.validUntil(v))}</Badge></div>
              ) })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
