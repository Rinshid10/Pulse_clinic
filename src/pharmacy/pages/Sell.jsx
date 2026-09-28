import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Plus, Minus, Search, Printer, Trash2, Pencil, PackagePlus, ShoppingCart, Pill, DollarSign, History, X, AlertTriangle, Send } from 'lucide-react'
import PageHeader from '../../admin/components/PageHeader'
import DataTable from '../../admin/components/DataTable'
import PharmacyBills, { PharmacyBillDetail, printPharmacyBill } from '../components/PharmacyBills'
import { RequestMedicineModal, MedicineRequestList } from '../components/MedicineRequests'
import Modal from '../../admin/components/Modal'
import FormField from '../../admin/components/FormField'
import StatCard from '../../admin/components/StatCard'
import { Avatar, Badge, Button, EmptyState } from '../../admin/components/ui'
import { useToast } from '../../admin/hooks/useToast'
import { useStore } from '../../admin/hooks/useStore'
import { useAuth } from '../hooks/useAuth'
import * as store from '../../services/billingStore'
import { money, fmtDate, to12h } from '../../admin/utils/format'

const BLANK_MED = { name: '', category: 'Tablet', unit: '', price: '', stock: '' }

export default function Sell() {
  const toast = useToast()
  const { user } = useAuth()
  const location = useLocation()
  const [tab, setTab] = useState('sell')
  const [meds] = useStore(() => store.getMedicines(), [])
  const [bills] = useStore(() => store.getPharmacyBills(), [])
  const [customers] = useStore(() => store.knownCustomers(), [])
  const [doctors] = useStore(() => store.getDoctors(), [])
  const [summary] = useStore(() => store.billingSummary(), [])
  const [pendingReq] = useStore(() => store.pendingMedicineRequests(), [])

  /* ---- sell ---- */
  const [customer, setCustomer] = useState({ name: '', phone: '', age: '' })
  const [doctorId, setDoctorId] = useState('')
  const [method, setMethod] = useState('Cash')
  const [discount, setDiscount] = useState(0)
  const [cart, setCart] = useState([]) // [{ medicineId, qty }]
  const [medQ, setMedQ] = useState('')
  const [view, setView] = useState(null)

  // Opened from the Medicine bills page with a customer to load into the sell screen.
  useEffect(() => {
    const c = location.state?.customer
    if (c) { setCustomer({ name: c.name, phone: c.phone || '', age: c.age ?? '' }); setTab('sell'); window.history.replaceState({}, '') }
  }, [location.state])

  const suggestions = customer.name.length >= 2 ? customers.filter((c) => c.name.toLowerCase().includes(customer.name.toLowerCase()) && c.name.toLowerCase() !== customer.name.toLowerCase()).slice(0, 5) : []
  const history = customer.name.trim().length >= 2 ? store.customerHistory(customer.name) : { bills: [], medicines: [], spent: 0 }
  const medMatches = useMemo(() => meds.filter((m) => !medQ || m.name.toLowerCase().includes(medQ.toLowerCase()) || m.category.toLowerCase().includes(medQ.toLowerCase())).slice(0, 8), [meds, medQ])
  const lines = cart.map((c) => { const m = meds.find((x) => x.id === c.medicineId); return m ? { ...m, qty: c.qty, lineTotal: Math.round(m.price * c.qty * 100) / 100 } : null }).filter(Boolean)
  const subtotal = Math.round(lines.reduce((a, l) => a + l.lineTotal, 0) * 100) / 100
  const total = Math.max(0, Math.round((subtotal - (Number(discount) || 0)) * 100) / 100)

  const addToCart = (m, qty = 1) => {
    if (m.stock <= 0) return toast('Out of stock', m.name, 'warn')
    setCart((c) => {
      const ex = c.find((x) => x.medicineId === m.id)
      const next = Math.min(m.stock, (ex?.qty || 0) + qty)
      return ex ? c.map((x) => (x.medicineId === m.id ? { ...x, qty: next } : x)) : [...c, { medicineId: m.id, qty: Math.min(m.stock, qty) }]
    })
  }
  const setQty = (id, qty) => setCart((c) => c.map((x) => (x.medicineId === id ? { ...x, qty: Math.max(1, Math.min(meds.find((m) => m.id === id)?.stock || 1, qty)) } : x)))
  const removeLine = (id) => setCart((c) => c.filter((x) => x.medicineId !== id))
  const pickCustomer = (c) => setCustomer({ name: c.name, phone: c.phone || '', age: c.age ?? '' })

  const checkout = () => {
    if (!customer.name.trim()) return toast('Customer name required', 'Type the name so the purchase is saved to their history', 'warn')
    if (!lines.length) return toast('Cart is empty', 'Add at least one medicine', 'warn')
    const bill = store.createPharmacyBill({ customer, items: cart, discount, method, doctorId, createdBy: user?.name || 'Pharmacy' })
    toast('Sale recorded', `${bill.no} · ${bill.customer.name} · ${money(bill.total)}`)
    setCart([]); setDiscount(0); setDoctorId(''); setMedQ('')
    setView(bill)
  }
  const print = (bill) => printPharmacyBill(bill, toast)

  /* ---- medicines tab ---- */
  const [medFilter, setMedFilter] = useState('all')
  const [edit, setEdit] = useState(null)
  const [restockOf, setRestockOf] = useState(null)
  const [request, setRequest] = useState(null) // { preset }
  const [restockQty, setRestockQty] = useState(10)
  const medRows = useMemo(() => meds.filter((m) => medFilter === 'all' ? true : medFilter === 'low' ? m.stock <= store.LOW_STOCK : m.category === medFilter).sort((a, b) => a.name.localeCompare(b.name)), [meds, medFilter])
  const saveMed = () => {
    if (!edit.name.trim()) return toast('Name required', '', 'warn')
    const patch = { ...edit, price: Number(edit.price) || 0, stock: Number(edit.stock) || 0 }
    if (edit.id) { store.updateMedicine(edit.id, patch); toast('Medicine updated', edit.name) } else { store.addMedicine(patch); toast('Medicine added', edit.name) }
    setEdit(null)
  }
  const medCols = [
    { key: 'name', header: 'Medicine', render: (m) => <><b>{m.name}</b><br /><small className="ad-muted">{m.unit}</small></> },
    { key: 'category', header: 'Category', render: (m) => <span className="ad-tag">{m.category}</span> },
    { key: 'price', header: 'Price', render: (m) => <b>{money(m.price)}</b> },
    { key: 'stock', header: 'Stock', render: (m) => m.stock <= 0 ? <Badge kind="red">Out of stock</Badge> : m.stock <= store.LOW_STOCK ? <Badge kind="amber">{m.stock} · low</Badge> : <Badge kind="green">{m.stock}</Badge> },
    { key: 'act', header: '', width: 130, render: (m) => (
      <div className="ad-rowact">
        <button className="go" title="Add to cart" onClick={() => { addToCart(m); setTab('sell'); toast('Added to cart', m.name, 'info') }}><ShoppingCart size={16} /></button>
        <button title="Request restock from admin" onClick={() => setRequest({ preset: m.id })}><Send size={16} /></button>
        <button title="Restock" onClick={() => { setRestockOf(m); setRestockQty(10) }}><PackagePlus size={16} /></button>
        <button title="Edit" onClick={() => setEdit({ ...m })}><Pencil size={16} /></button>
        {user?.role === 'admin' && <button className="danger" title="Delete" onClick={() => { store.deleteMedicine(m.id); toast('Medicine removed', m.name, 'info') }}><Trash2 size={16} /></button>}
      </div>
    ) },
  ]
  const lowCount = meds.filter((m) => m.stock <= store.LOW_STOCK).length

  return (
    <>
      <PageHeader title="Pharmacy" subtitle="Sell medicines, keep the catalog and stock, and look up what a customer bought before.">
        <div className="ad-seg">
          {[['sell', 'Sell'], ['bills', 'Bills'], ['medicines', `Medicines${lowCount ? ` (${lowCount} low)` : ''}`]].map(([k, l]) => <button key={k} className={tab === k ? 'active' : ''} onClick={() => setTab(k)}>{l}</button>)}
        </div>
      </PageHeader>

      <div className="ad-grid ad-stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 18 }}>
        <StatCard index={0} icon={DollarSign} tone="green" value={money(summary.pharmacyToday)} label={`Pharmacy sales today · ${bills.filter((b) => b.date === store.TODAY).length} bills`} />
        <StatCard index={1} icon={Pill} tone="brand" value={meds.length} label="Medicines in catalog" trend={pendingReq ? `${pendingReq} request${pendingReq === 1 ? '' : 's'} awaiting admin` : lowCount ? `${lowCount} low stock` : 'stock ok'} up={!lowCount} />
        <StatCard index={2} icon={DollarSign} tone="violet" value={money(summary.pharmacyMonth)} label="This month" trend={`all time ${money(summary.pharmacyAll)}`} up />
      </div>

      {tab === 'sell' && (
        <div className="ad-grid" style={{ gridTemplateColumns: '1.4fr 1fr', alignItems: 'start' }}>
          <div style={{ display: 'grid', gap: 18 }}>
            <div className="ad-card">
              <div className="ad-card__head"><h3>Customer</h3><span className="ad-muted" style={{ fontSize: 12.5 }}>Type the name — returning customers show their history</span></div>
              <div className="ad-card__body ad-form-grid">
                <FormField label="Name" span2>
                  <div style={{ position: 'relative' }}>
                    <input value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} placeholder="Customer name" autoComplete="off" />
                    {suggestions.length > 0 && (
                      <div className="ad-suggest">
                        {suggestions.map((c) => <button type="button" key={c.name} onClick={() => pickCustomer(c)}><b>{c.name}</b><span>{c.purchases} purchase{c.purchases === 1 ? '' : 's'} · last {fmtDate(c.lastVisit)} · {money(c.spent)}</span></button>)}
                      </div>
                    )}
                  </div>
                </FormField>
                <FormField label="Phone"><input value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} /></FormField>
                <FormField label="Age"><input type="number" min="0" value={customer.age} onChange={(e) => setCustomer({ ...customer, age: e.target.value })} /></FormField>
                <FormField label="Prescribed by (optional)" span2>
                  <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)}><option value="">—</option>{doctors.map((d) => <option key={d.id} value={d.id}>{d.name} — {d.specialty}</option>)}</select>
                </FormField>
              </div>
            </div>

            <div className="ad-card">
              <div className="ad-card__head"><h3>Add medicines</h3><div className="ad-search" style={{ margin: 0 }}><Search size={16} /><input placeholder="Search medicine…" value={medQ} onChange={(e) => setMedQ(e.target.value)} /></div></div>
              <div className="ad-card__body" style={{ display: 'grid', gap: 6 }}>
                {medMatches.map((m) => (
                  <div key={m.id} className="ad-medrow">
                    <div><b>{m.name}</b><small>{m.category} · {m.unit} · {m.stock <= 0 ? <span style={{ color: 'var(--ad-red)' }}>out of stock</span> : m.stock <= store.LOW_STOCK ? <span style={{ color: 'var(--ad-amber)' }}>{m.stock} left</span> : `${m.stock} in stock`}</small></div>
                    <b>{money(m.price)}</b>
                    <button className="ad-btn ad-btn--sm" disabled={m.stock <= 0} onClick={() => addToCart(m)}><Plus size={14} /> Add</button>
                  </div>
                ))}
                {medMatches.length === 0 && <p className="ad-muted">No medicine matches.</p>}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 18 }}>
            <div className="ad-card">
              <div className="ad-card__head"><h3><ShoppingCart size={16} style={{ verticalAlign: -3 }} /> Bill</h3>{lines.length > 0 && <button className="ad-btn ad-btn--ghost ad-btn--sm" onClick={() => setCart([])}>Clear</button>}</div>
              <div className="ad-card__body">
                {lines.length === 0 && <EmptyState icon={Pill} title="No medicines added yet." />}
                {lines.map((l) => (
                  <div key={l.id} className="ad-cartline">
                    <div style={{ flex: 1, minWidth: 0 }}><b>{l.name}</b><small className="ad-muted" style={{ display: 'block' }}>{money(l.price)} × {l.qty}</small></div>
                    <div className="ad-qty"><button onClick={() => setQty(l.id, l.qty - 1)}><Minus size={13} /></button><span>{l.qty}</span><button onClick={() => setQty(l.id, l.qty + 1)}><Plus size={13} /></button></div>
                    <b style={{ width: 64, textAlign: 'right' }}>{money(l.lineTotal)}</b>
                    <button className="ad-iconbtn" style={{ width: 28, height: 28 }} onClick={() => removeLine(l.id)}><X size={14} /></button>
                  </div>
                ))}
                {lines.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div className="ad-form-grid">
                      <FormField label="Discount ($)"><input type="number" min="0" value={discount} onChange={(e) => setDiscount(e.target.value)} /></FormField>
                      <FormField label="Payment"><select value={method} onChange={(e) => setMethod(e.target.value)}>{store.PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}</select></FormField>
                    </div>
                    <div className="ad-total" style={{ marginTop: 12 }}>
                      <div className="ad-kv"><span>Subtotal</span><b>{money(subtotal)}</b></div>
                      {Number(discount) > 0 && <div className="ad-kv"><span>Discount</span><b>- {money(discount)}</b></div>}
                      <div className="ad-kv" style={{ fontSize: 17 }}><span><b>Total</b></span><b>{money(total)}</b></div>
                    </div>
                    <Button block style={{ marginTop: 12 }} onClick={checkout}><Printer size={15} /> Save bill · {money(total)}</Button>
                  </div>
                )}
              </div>
            </div>

            <div className="ad-card">
              <div className="ad-card__head"><h3><History size={16} style={{ verticalAlign: -3 }} /> Past purchases</h3>{history.bills.length > 0 && <span className="ad-tag">{history.bills.length} bills · {money(history.spent)}</span>}</div>
              <div className="ad-card__body">
                {customer.name.trim().length < 2 && <p className="ad-muted">Enter a customer name to see what they bought before.</p>}
                {customer.name.trim().length >= 2 && history.bills.length === 0 && <p className="ad-muted">No previous purchases for “{customer.name}”. This will be their first bill.</p>}
                {history.medicines.length > 0 && (
                  <>
                    <div style={{ fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--ad-text-3)', fontWeight: 700, marginBottom: 6 }}>Medicines bought before</div>
                    <div style={{ display: 'grid', gap: 6, marginBottom: 14 }}>
                      {history.medicines.map((m) => {
                        const cat = meds.find((x) => x.id === m.medicineId)
                        return (
                          <div key={m.name} className="ad-medrow">
                            <div><b>{m.name}</b><small>{m.times}× · total qty {m.qty} · last {fmtDate(m.last)}</small></div>
                            {cat && <button className="ad-btn ad-btn--ghost ad-btn--sm" disabled={cat.stock <= 0} onClick={() => addToCart(cat)}><Plus size={13} /> Again</button>}
                          </div>
                        )
                      })}
                    </div>
                    <div style={{ fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--ad-text-3)', fontWeight: 700, marginBottom: 6 }}>Previous bills</div>
                    <div style={{ display: 'grid', gap: 6 }}>
                      {history.bills.map((b) => (
                        <div key={b.id} className="ad-hist" style={{ cursor: 'pointer' }} onClick={() => setView(b)}>
                          <div><b>{b.no}</b> · {fmtDate(b.date)} {to12h(b.time)}<br /><small className="ad-muted">{b.items.map((i) => `${i.name} ×${i.qty}`).join(', ')}</small></div>
                          <b>{money(b.total)}</b>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'bills' && <PharmacyBills onLoadCustomer={(c) => { setTab('sell'); pickCustomer(c) }} />}

      {tab === 'medicines' && (
        <>
          <div className="ad-toolbar">
            <div className="ad-chips">
              {['all', 'low', ...store.MEDICINE_CATEGORIES].map((c) => <button key={c} className={`ad-chip ${medFilter === c ? 'active' : ''}`} onClick={() => setMedFilter(c)}>{c === 'low' ? <><AlertTriangle size={12} /> Low stock</> : c}</button>)}
            </div>
            <Button sm variant="ghost" style={{ marginLeft: 'auto' }} onClick={() => setRequest({ preset: '' })}><Send size={14} /> Request medicine</Button>
            <Button sm onClick={() => setEdit({ ...BLANK_MED })}><Plus size={14} /> Add medicine</Button>
          </div>
          <DataTable columns={medCols} rows={medRows} empty="No medicines." />
          <div className="ad-card" style={{ marginTop: 22 }}>
            <div className="ad-card__head"><h3><Send size={15} style={{ verticalAlign: -2 }} /> Requests to admin</h3><span className="ad-muted" style={{ fontSize: 12.5 }}>Restocks and new medicines you asked for</span></div>
            <div className="ad-card__body"><MedicineRequestList /></div>
          </div>
        </>
      )}

      {/* view bill */}
      <Modal open={!!view} onClose={() => setView(null)} title={view?.no} subtitle={view && `${fmtDate(view.date)} · ${to12h(view.time)} · ${view.createdBy}`} width={520}
        footer={view && <><Button variant="ghost" onClick={() => setView(null)}>Close</Button><Button onClick={() => print(view)}><Printer size={15} /> Print</Button></>}>
        {view && <PharmacyBillDetail bill={view} />}
      </Modal>

      {/* add / edit medicine */}
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

      <RequestMedicineModal open={!!request} preset={request?.preset} onClose={() => setRequest(null)} />

      {/* restock */}
      <Modal open={!!restockOf} onClose={() => setRestockOf(null)} title="Restock" subtitle={restockOf && `${restockOf.name} · currently ${restockOf.stock}`} width={380}
        footer={<><Button variant="ghost" onClick={() => setRestockOf(null)}>Cancel</Button><Button onClick={() => { store.restock(restockOf.id, restockQty); toast('Stock updated', `${restockOf.name} +${restockQty}`); setRestockOf(null) }}>Add stock</Button></>}>
        <FormField label="Quantity to add"><input type="number" min="1" value={restockQty} onChange={(e) => setRestockQty(Number(e.target.value))} autoFocus /></FormField>
      </Modal>

    </>
  )
}
