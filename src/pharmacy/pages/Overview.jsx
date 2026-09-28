import { useNavigate } from 'react-router-dom'
import { DollarSign, Pill, FileText, ShoppingCart, AlertTriangle, ArrowRight, Send, Users } from 'lucide-react'
import PageHeader from '../../admin/components/PageHeader'
import StatCard from '../../admin/components/StatCard'
import { Avatar, Badge, Button } from '../../admin/components/ui'
import { useStore } from '../../admin/hooks/useStore'
import { useAuth } from '../hooks/useAuth'
import * as store from '../../services/billingStore'
import { money, fmtDate, to12h } from '../../admin/utils/format'
import { RequestStatus } from '../components/MedicineRequests'

export default function Overview() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [summary] = useStore(() => store.billingSummary(), [])
  const [bills] = useStore(() => store.getPharmacyBills().sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time)).slice(0, 8), [])
  const [meds] = useStore(() => store.getMedicines(), [])
  const [requests] = useStore(() => store.getMedicineRequests().slice(0, 5), [])
  const [customers] = useStore(() => store.knownCustomers(), [])
  const lowStock = meds.filter((m) => m.stock <= store.LOW_STOCK).sort((a, b) => a.stock - b.stock)
  const todayCount = store.getPharmacyBills().filter((b) => b.date === store.TODAY).length
  const topMeds = (() => {
    const m = {}
    store.getPharmacyBills().filter((b) => b.date.startsWith(store.TODAY.slice(0, 7))).forEach((b) => b.items.forEach((i) => { m[i.name] = (m[i.name] || 0) + i.qty }))
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 5)
  })()

  return (
    <>
      <PageHeader title={`Hello, ${user.name.split(' ')[0]} 👋`} subtitle={`Pharmacy sales for ${fmtDate(store.TODAY)}.`}>
        <Button variant="ghost" onClick={() => navigate('/pharmacy/medicine-bills')}><FileText size={16} /> Medicine bills</Button>
        <Button onClick={() => navigate('/pharmacy/sell')}><ShoppingCart size={16} /> Sell medicines</Button>
      </PageHeader>

      <div className="ad-grid ad-stats" style={{ marginBottom: 18 }}>
        <StatCard index={0} icon={DollarSign} tone="brand" value={money(summary.pharmacyToday)} label={`Sales today · ${todayCount} bill${todayCount === 1 ? '' : 's'}`} trend={`month ${money(summary.pharmacyMonth)}`} up />
        <StatCard index={1} icon={DollarSign} tone="green" value={money(summary.pharmacyAll)} label="All-time sales" trend={`${customers.length} customers`} up />
        <StatCard index={2} icon={Pill} tone="violet" value={meds.length} label="Medicines in catalog" trend={`${meds.reduce((a, m) => a + m.stock, 0)} units in stock`} up />
        <StatCard index={3} icon={AlertTriangle} tone={lowStock.length ? 'amber' : 'green'} value={lowStock.length} label="Low or out of stock" trend={`${store.pendingMedicineRequests()} request${store.pendingMedicineRequests() === 1 ? '' : 's'} with admin`} up={!lowStock.length} />
      </div>

      <div className="ad-grid ad-cols-2">
        <div className="ad-card">
          <div className="ad-card__head"><h3>Recent medicine bills</h3><button className="ad-btn ad-btn--ghost ad-btn--sm" onClick={() => navigate('/pharmacy/medicine-bills')}>All bills <ArrowRight size={14} /></button></div>
          <div className="ad-card__body" style={{ display: 'grid', gap: 8 }}>
            {bills.length === 0 && <p className="ad-muted">No sales yet.</p>}
            {bills.map((b) => (
              <div key={b.id} className="ad-hist">
                <div className="ad-cell-user">
                  <Avatar name={b.customer.name} color="#a855f7" size="sm" />
                  <div><b>{b.customer.name}</b><small>{b.no} · {b.items.map((i) => `${i.name} ×${i.qty}`).join(', ')} · {fmtDate(b.date)} {to12h(b.time)}</small></div>
                </div>
                <b>{money(b.total)}</b>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gap: 18, alignContent: 'start' }}>
          <div className="ad-card">
            <div className="ad-card__head"><h3><AlertTriangle size={15} style={{ verticalAlign: -2, color: 'var(--ad-amber)' }} /> Low stock</h3><button className="ad-btn ad-btn--ghost ad-btn--sm" onClick={() => navigate('/pharmacy/sell')}>Request restock</button></div>
            <div className="ad-card__body" style={{ display: 'grid', gap: 8 }}>
              {lowStock.length === 0 && <p className="ad-muted">All medicines are well stocked.</p>}
              {lowStock.map((m) => <div key={m.id} className="ad-hist"><div><b>{m.name}</b><br /><small className="ad-muted">{m.category} · {m.unit}</small></div>{m.stock <= 0 ? <Badge kind="red">Out</Badge> : <Badge kind="amber">{m.stock} left</Badge>}</div>)}
            </div>
          </div>

          <div className="ad-card">
            <div className="ad-card__head"><h3>Top sellers this month</h3></div>
            <div className="ad-card__body">
              {topMeds.length === 0 && <p className="ad-muted">No sales this month.</p>}
              {topMeds.map(([name, qty]) => <div className="ad-kv" key={name}><span>{name}</span><b>{qty} units</b></div>)}
            </div>
          </div>

          <div className="ad-card">
            <div className="ad-card__head"><h3><Send size={15} style={{ verticalAlign: -2 }} /> Requests to admin</h3></div>
            <div className="ad-card__body" style={{ display: 'grid', gap: 8 }}>
              {requests.length === 0 && <p className="ad-muted">No requests yet.</p>}
              {requests.map((r) => <div key={r.id} className="ad-hist"><div><b>{r.kind === 'new' ? 'New: ' : 'Restock: '}{r.name}</b> × {r.qty}<br /><small className="ad-muted">{fmtDate(r.date)}{r.note ? ` · ${r.note}` : ''}</small></div><RequestStatus status={r.status} /></div>)}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
