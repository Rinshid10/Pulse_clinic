import { useMemo, useState } from 'react'
import { Plus, Pencil, PackagePlus, Trash2, Search, Pill, AlertTriangle, PackageX, DollarSign, ExternalLink, Check, X, Inbox } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import FormField from '../components/FormField'
import StatCard from '../components/StatCard'
import ConfirmDialog from '../components/ConfirmDialog'
import { Badge, Button } from '../components/ui'
import { useStore } from '../hooks/useStore'
import { useToast } from '../hooks/useToast'
import { useAuth } from '../hooks/useAuth'
import * as store from '../../services/billingStore'
import { money, fmtDate } from '../utils/format'

const BLANK = { name: '', category: 'Tablet', unit: '', price: '', stock: '' }

export default function MedicineStock() {
  const toast = useToast()
  const { user } = useAuth()
  const [meds] = useStore(() => store.getMedicines(), [])
  const [bills] = useStore(() => store.getPharmacyBills(), [])
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')
  const [edit, setEdit] = useState(null)
  const [restockOf, setRestockOf] = useState(null)
  const [restockQty, setRestockQty] = useState(20)
  const [del, setDel] = useState(null)
  const [requests] = useStore(() => store.getMedicineRequests(), [])
  const [showHistory, setShowHistory] = useState(false)
  const [decision, setDecision] = useState(null) // { id, status, note, label }
  const pendingReqs = requests.filter((r) => r.status === 'pending')
  const shownReqs = showHistory ? requests.filter((r) => r.status !== 'pending') : pendingReqs
  const decide = () => {
    store.decideMedicineRequest(decision.id, decision.status, user?.name || 'Admin', decision.note)
    toast(decision.status === 'approved' ? 'Request approved' : 'Request rejected', decision.label, decision.status === 'approved' ? 'success' : 'info')
    setDecision(null)
  }

  const month = store.TODAY.slice(0, 7)
  const sold = useMemo(() => {
    const m = {}, t = {}, last = {}
    bills.forEach((b) => b.items.forEach((i) => {
      if (b.date.startsWith(month)) m[i.medicineId] = (m[i.medicineId] || 0) + i.qty
      t[i.medicineId] = (t[i.medicineId] || 0) + i.qty
      if (!last[i.medicineId] || b.date > last[i.medicineId]) last[i.medicineId] = b.date
    }))
    return { month: m, total: t, last }
  }, [bills, month])

  const rows = useMemo(() => meds
    .filter((m) => filter === 'all' ? true : filter === 'low' ? m.stock > 0 && m.stock <= store.LOW_STOCK : filter === 'out' ? m.stock <= 0 : m.category === filter)
    .filter((m) => !q || `${m.name} ${m.category} ${m.unit}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => a.stock - b.stock || a.name.localeCompare(b.name)), [meds, filter, q])

  const low = meds.filter((m) => m.stock > 0 && m.stock <= store.LOW_STOCK).length
  const out = meds.filter((m) => m.stock <= 0).length
  const value = meds.reduce((a, m) => a + m.stock * m.price, 0)

  const saveMed = () => {
    if (!edit.name.trim()) return toast('Name required', '', 'warn')
    const patch = { ...edit, price: Number(edit.price) || 0, stock: Number(edit.stock) || 0 }
    if (edit.id) { store.updateMedicine(edit.id, patch); toast('Medicine updated', edit.name) } else { store.addMedicine(patch); toast('Medicine added', edit.name) }
    setEdit(null)
  }

  const columns = [
    { key: 'name', header: 'Medicine', render: (m) => <><b>{m.name}</b><br /><small className="ad-muted">{m.category} · {m.unit}</small></> },
    { key: 'stock', header: 'In stock', render: (m) => m.stock <= 0 ? <Badge kind="red">Out of stock</Badge> : m.stock <= store.LOW_STOCK ? <Badge kind="amber">{m.stock} · low</Badge> : <Badge kind="green">{m.stock}</Badge> },
    { key: 'price', header: 'Price', render: (m) => <>{money(m.price)}<br /><small className="ad-muted">value {money(m.stock * m.price)}</small></> },
    { key: 'sold', header: 'Sold', render: (m) => <><b>{sold.month[m.id] || 0}</b> this month<br /><small className="ad-muted">{sold.total[m.id] || 0} all time{sold.last[m.id] ? ` · last ${fmtDate(sold.last[m.id])}` : ''}</small></> },
    { key: 'act', header: '', width: 120, render: (m) => (
      <div className="ad-rowact">
        <button className="go" title="Restock" onClick={() => { setRestockOf(m); setRestockQty(20) }}><PackagePlus size={16} /></button>
        <button title="Edit" onClick={() => setEdit({ ...m })}><Pencil size={16} /></button>
        {user?.role === 'admin' && <button className="danger" title="Delete" onClick={() => setDel(m)}><Trash2 size={16} /></button>}
      </div>
    ) },
  ]

  return (
    <>
      <PageHeader title="Medicine stock" subtitle="Pharmacy catalog and stock levels. Sales from the billing desk reduce stock automatically.">
        <a className="ad-btn ad-btn--ghost" href="/pharmacy/sell" target="_blank" rel="noreferrer"><ExternalLink size={16} /> Pharmacy desk</a>
        <Button onClick={() => setEdit({ ...BLANK })}><Plus size={16} /> Add medicine</Button>
      </PageHeader>

      <div className="ad-grid ad-stats" style={{ marginBottom: 18 }}>
        <StatCard index={0} icon={Pill} tone="brand" value={meds.length} label="Medicines in catalog" trend={`${meds.reduce((a, m) => a + m.stock, 0)} units`} up />
        <StatCard index={1} icon={AlertTriangle} tone="amber" value={low} label={`Low stock (≤ ${store.LOW_STOCK})`} trend="restock soon" up={low === 0} />
        <StatCard index={2} icon={PackageX} tone="red" value={out} label="Out of stock" trend={out ? 'cannot be sold' : 'all available'} up={out === 0} />
        <StatCard index={3} icon={DollarSign} tone="green" value={money(value)} label="Stock value at sale price" trend={`${Object.values(sold.month).reduce((a, b) => a + b, 0)} units sold this month`} up />
      </div>

      <div className="ad-card" style={{ marginBottom: 18 }}>
        <div className="ad-card__head">
          <h3><Inbox size={15} style={{ verticalAlign: -2 }} /> Requests from the pharmacy desk{pendingReqs.length > 0 && <Badge kind="amber">{pendingReqs.length} pending</Badge>}</h3>
          <div className="ad-seg"><button className={!showHistory ? 'active' : ''} onClick={() => setShowHistory(false)}>Pending</button><button className={showHistory ? 'active' : ''} onClick={() => setShowHistory(true)}>History</button></div>
        </div>
        <div className="ad-card__body" style={{ display: 'grid', gap: 8 }}>
          {shownReqs.length === 0 && <p className="ad-muted">{showHistory ? 'No decisions yet.' : 'Nothing waiting. The pharmacy can request restocks or suggest new medicines from the pharmacy desk.'}</p>}
          {shownReqs.map((r) => (
            <div key={r.id} className="ad-hist">
              <div>
                <Badge kind={r.kind === 'new' ? 'violet' : 'blue'}>{r.kind === 'new' ? 'New medicine' : 'Restock'}</Badge> <b>{r.name}</b> × {r.qty}
                {r.kind === 'new' && <small className="ad-muted"> · {r.category} · {r.unit || '—'}{r.price ? ` · ${money(r.price)}` : ''}</small>}
                {r.kind === 'restock' && r.medicineId && <small className="ad-muted"> · currently {store.getMedicine(r.medicineId)?.stock ?? '—'} in stock</small>}
                <br /><small className="ad-muted">{r.reason} · {r.by} · {fmtDate(r.date)}{r.decidedBy ? ` · ${r.decidedBy}${r.note ? `: ${r.note}` : ''}` : ''}</small>
              </div>
              {r.status === 'pending' ? (
                <div className="ad-rowact">
                  <button className="go" title="Approve" onClick={() => setDecision({ id: r.id, status: 'approved', note: '', label: `${r.name} × ${r.qty}` })}><Check size={16} /></button>
                  <button className="danger" title="Reject" onClick={() => setDecision({ id: r.id, status: 'rejected', note: '', label: `${r.name} × ${r.qty}` })}><X size={16} /></button>
                </div>
              ) : <Badge kind={r.status === 'approved' ? 'green' : 'red'}>{r.status === 'approved' ? 'Approved' : 'Rejected'}</Badge>}
            </div>
          ))}
        </div>
      </div>

      <div className="ad-toolbar">
        <div className="ad-search"><Search size={16} /><input placeholder="Search medicine…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div className="ad-chips">
          {[['all', 'All'], ['low', 'Low stock'], ['out', 'Out of stock'], ...store.MEDICINE_CATEGORIES.map((c) => [c, c])].map(([k, l]) => (
            <button key={k} className={`ad-chip ${filter === k ? 'active' : ''}`} onClick={() => setFilter(k)}>{l}</button>
          ))}
        </div>
      </div>

      <DataTable columns={columns} rows={rows} empty="No medicines match." />

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'Edit medicine' : 'Add medicine'} width={480}
        footer={<><Button variant="ghost" onClick={() => setEdit(null)}>Cancel</Button><Button onClick={saveMed}>Save</Button></>}>
        {edit && (
          <div className="ad-form-grid">
            <FormField label="Name" span2><input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} placeholder="e.g. Paracetamol 500mg" autoFocus /></FormField>
            <FormField label="Category"><select value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value })}>{store.MEDICINE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></FormField>
            <FormField label="Unit / pack"><input value={edit.unit} onChange={(e) => setEdit({ ...edit, unit: e.target.value })} placeholder="strip of 10" /></FormField>
            <FormField label="Price ($)"><input type="number" min="0" step="0.1" value={edit.price} onChange={(e) => setEdit({ ...edit, price: e.target.value })} /></FormField>
            <FormField label="Stock"><input type="number" min="0" value={edit.stock} onChange={(e) => setEdit({ ...edit, stock: e.target.value })} /></FormField>
          </div>
        )}
      </Modal>

      <Modal open={!!restockOf} onClose={() => setRestockOf(null)} title="Restock" subtitle={restockOf && `${restockOf.name} · currently ${restockOf.stock}`} width={380}
        footer={<><Button variant="ghost" onClick={() => setRestockOf(null)}>Cancel</Button><Button onClick={() => { store.restock(restockOf.id, restockQty); toast('Stock updated', `${restockOf.name} +${restockQty}`); setRestockOf(null) }}>Add stock</Button></>}>
        <FormField label="Quantity to add"><input type="number" min="1" value={restockQty} onChange={(e) => setRestockQty(Number(e.target.value))} autoFocus /></FormField>
      </Modal>

      <Modal open={!!decision} onClose={() => setDecision(null)} title={decision?.status === 'approved' ? 'Approve request' : 'Reject request'} subtitle={decision?.label} width={440}
        footer={<><Button variant="ghost" onClick={() => setDecision(null)}>Cancel</Button><Button variant={decision?.status === 'approved' ? 'primary' : 'danger'} onClick={decide}>{decision?.status === 'approved' ? 'Approve' : 'Reject'}</Button></>}>
        {decision && (
          <>
            <p className="ad-muted" style={{ fontSize: 13, marginBottom: 12 }}>{decision.status === 'approved' ? 'Approving a restock adds the quantity to stock. Approving a new medicine adds it to the catalog with that quantity.' : 'The pharmacy desk will see your reason.'}</p>
            <FormField label="Note (optional)"><textarea rows="3" value={decision.note} onChange={(e) => setDecision({ ...decision, note: e.target.value })} placeholder={decision.status === 'approved' ? 'e.g. Ordered from supplier, arriving Friday' : 'Why not?'} autoFocus /></FormField>
          </>
        )}
      </Modal>

      <ConfirmDialog open={!!del} title="Remove this medicine?" message={del && `${del.name} will be removed from the catalog. Past bills keep their record.`} confirmLabel="Remove" danger
        onCancel={() => setDel(null)} onConfirm={() => { store.deleteMedicine(del.id); setDel(null); toast('Medicine removed', del.name, 'info') }} />
    </>
  )
}
