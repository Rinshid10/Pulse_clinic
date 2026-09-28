import { useNavigate } from 'react-router-dom'
import { DollarSign, Receipt, Pill, BadgeCheck, ArrowRight, AlertTriangle } from 'lucide-react'
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
    ...store.getPharmacyBills().map((b) => ({ id: b.id, kind: 'Pharmacy', no: b.no, name: b.customer.name, sub: `${b.items.length} item${b.items.length === 1 ? '' : 's'}`, total: b.total, date: b.date, time: b.time })),
  ].sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time)).slice(0, 8), [])
  const [lowStock] = useStore(() => store.getMedicines().filter((m) => m.stock <= store.LOW_STOCK).sort((a, b) => a.stock - b.stock), [])
  const canBill = user.role !== 'pharmacist'
  const canSell = user.role !== 'cashier'

  return (
    <>
      <PageHeader title={`Hello, ${user.name.split(' ')[0]} 👋`} subtitle={`Collections for ${fmtDate(store.TODAY)}.`}>
        {canBill && <Button variant="ghost" onClick={() => navigate('/billing/bills')}><Receipt size={16} /> New consultation bill</Button>}
        {canSell && <Button onClick={() => navigate('/billing/pharmacy')}><Pill size={16} /> Sell medicines</Button>}
      </PageHeader>

      <div className="ad-grid ad-stats" style={{ marginBottom: 18 }}>
        <StatCard index={0} icon={DollarSign} tone="brand" value={money(summary.combinedToday)} label="Total collected today" trend={`month ${money(summary.month + summary.pharmacyMonth)}`} up />
        <StatCard index={1} icon={Receipt} tone="green" value={money(summary.today)} label={`Consultations today · ${summary.todayCount} bill${summary.todayCount === 1 ? '' : 's'}`} trend={`${summary.todayFollowUps} free follow-up${summary.todayFollowUps === 1 ? '' : 's'}`} up />
        <StatCard index={2} icon={Pill} tone="violet" value={money(summary.pharmacyToday)} label="Pharmacy today" trend={`month ${money(summary.pharmacyMonth)}`} up />
        <StatCard index={3} icon={BadgeCheck} tone="amber" value={money(summary.all + summary.pharmacyAll)} label="All-time collections" trend={`${summary.count} consultation bills`} up />
      </div>

      <div className="ad-grid ad-cols-2">
        <div className="ad-card">
          <div className="ad-card__head"><h3>Recent bills</h3></div>
          <div className="ad-card__body" style={{ display: 'grid', gap: 8 }}>
            {recent.map((r) => (
              <div key={r.id} className="ad-hist">
                <div className="ad-cell-user">
                  <Avatar name={r.name} color={r.kind === 'Pharmacy' ? '#a855f7' : '#4f6cf7'} size="sm" />
                  <div><b>{r.name}</b><small>{r.no} · {r.sub} · {fmtDate(r.date)} {to12h(r.time)}</small></div>
                </div>
                <div style={{ textAlign: 'right' }}><b>{money(r.total)}</b><br />{r.free ? <Badge kind="violet">Free follow-up</Badge> : <Badge kind={r.kind === 'Pharmacy' ? 'violet' : 'blue'}>{r.kind}</Badge>}</div>
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
            <div className="ad-card__head"><h3><AlertTriangle size={15} style={{ verticalAlign: -2, color: 'var(--ad-amber)' }} /> Low stock</h3>{canSell && <button className="ad-btn ad-btn--ghost ad-btn--sm" onClick={() => navigate('/billing/pharmacy')}>Manage <ArrowRight size={14} /></button>}</div>
            <div className="ad-card__body" style={{ display: 'grid', gap: 8 }}>
              {lowStock.length === 0 && <p className="ad-muted">All medicines are well stocked.</p>}
              {lowStock.map((m) => (
                <div key={m.id} className="ad-hist"><div><b>{m.name}</b><br /><small className="ad-muted">{m.category} · {m.unit}</small></div>{m.stock <= 0 ? <Badge kind="red">Out</Badge> : <Badge kind="amber">{m.stock} left</Badge>}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
