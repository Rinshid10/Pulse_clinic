import { useMemo, useState } from 'react'
import { Search, Printer, Eye, Trash2, History } from 'lucide-react'
import DataTable from '../../admin/components/DataTable'
import Modal from '../../admin/components/Modal'
import ConfirmDialog from '../../admin/components/ConfirmDialog'
import { Avatar, Button } from '../../admin/components/ui'
import { useToast } from '../../admin/hooks/useToast'
import { useStore } from '../../admin/hooks/useStore'
import { useAuth } from '../hooks/useAuth'
import * as store from '../../services/billingStore'
import { money, fmtDate, to12h } from '../../admin/utils/format'
import { printHtml, esc } from '../../admin/utils/print'

export function pharmacyHtml(bill) {
  const doc = bill.doctorId ? store.getDoctor(bill.doctorId) : null
  return `
    <div class="head"><div><h1>Pulse Pharmacy</h1><h2>Medicine bill</h2></div><div style="text-align:right"><h1>${esc(bill.no)}</h1><h2>${fmtDate(bill.date)} · ${to12h(bill.time)}</h2></div></div>
    <div class="meta">
      <div><b>Customer</b>${esc(bill.customer.name)}${bill.customer.age ? `, ${bill.customer.age} yrs` : ''}</div>
      <div><b>Phone</b>${esc(bill.customer.phone || '—')}</div>
      <div><b>Prescribed by</b>${esc(doc?.name || '—')}</div><div><b>Payment</b>${esc(bill.method)}</div>
    </div>
    <table><thead><tr><th>Medicine</th><th class="r">Qty</th><th class="r">Price</th><th class="r">Total</th></tr></thead><tbody>
      ${bill.items.map((i) => `<tr><td>${esc(i.name)}<br><span style="color:#8a93ab;font-size:12px">${esc(i.unit || '')}</span></td><td class="r">${i.qty}</td><td class="r">${money(i.price)}</td><td class="r">${money(i.total)}</td></tr>`).join('')}
    </tbody></table>
    <table class="tot" style="margin-top:8px"><tbody>
      <tr><td>Subtotal</td><td class="r">${money(bill.subtotal)}</td></tr>
      ${bill.discount ? `<tr><td>Discount</td><td class="r">- ${money(bill.discount)}</td></tr>` : ''}
      <tr class="grand"><td>Total paid</td><td class="r">${money(bill.total)}</td></tr>
    </tbody></table>
    <div class="foot">Keep medicines out of reach of children · Pulse Clinic Pharmacy</div>`
}

export const printPharmacyBill = (bill, toast) => {
  if (!printHtml(`Pharmacy ${bill.no}`, pharmacyHtml(bill))) toast?.('Pop-up blocked', 'Allow pop-ups to print', 'warn')
}

/** Read-only detail of one pharmacy bill (used inside modals). */
export function PharmacyBillDetail({ bill }) {
  return (
    <div>
      <div className="ad-kv"><span>Customer</span><b>{bill.customer.name}{bill.customer.age ? `, ${bill.customer.age} yrs` : ''}</b></div>
      <div className="ad-kv"><span>Phone</span><b>{bill.customer.phone || '—'}</b></div>
      <div className="ad-kv"><span>Prescribed by</span><b>{store.getDoctor(bill.doctorId)?.name || '—'}</b></div>
      <div style={{ margin: '12px 0 4px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--ad-text-3)', fontWeight: 700 }}>Medicines</div>
      {bill.items.map((i, k) => <div className="ad-kv" key={k}><span>{i.name} <small className="ad-muted">× {i.qty}</small></span><b>{money(i.total)}</b></div>)}
      {bill.discount > 0 && <div className="ad-kv"><span>Discount</span><b>- {money(bill.discount)}</b></div>}
      <div className="ad-kv" style={{ fontSize: 16 }}><span><b>Total · {bill.method}</b></span><b>{money(bill.total)}</b></div>
    </div>
  )
}

/** Filterable list of every pharmacy (medicine) bill with view / print / delete.
    `onLoadCustomer(customer)` shows a "load into sell screen" action when given. */
export default function PharmacyBills({ onLoadCustomer, defaultRange = 'today' }) {
  const toast = useToast()
  const { user } = useAuth()
  const [bills] = useStore(() => store.getPharmacyBills(), [])
  const [range, setRange] = useState(defaultRange)
  const [q, setQ] = useState('')
  const [view, setView] = useState(null)
  const [del, setDel] = useState(null)

  const rows = useMemo(() => bills
    .filter((b) => store.inRange(b.date, range))
    .filter((b) => !q || `${b.customer.name} ${b.no} ${b.customer.phone} ${b.items.map((i) => i.name).join(' ')}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time)), [bills, range, q])

  const columns = [
    { key: 'no', header: 'Bill', render: (b) => <><b>{b.no}</b><br /><small className="ad-muted">{fmtDate(b.date)} · {to12h(b.time)}</small></> },
    { key: 'customer', header: 'Customer', render: (b) => <div className="ad-cell-user"><Avatar name={b.customer.name} color="#a855f7" size="sm" /><div><b>{b.customer.name}</b><small>{b.customer.age ? `${b.customer.age} yrs · ` : ''}{b.customer.phone || '—'}</small></div></div> },
    { key: 'items', header: 'Medicines', render: (b) => <span>{b.items.map((i) => `${i.name} ×${i.qty}`).join(', ')}</span> },
    { key: 'doctor', header: 'Prescribed by', render: (b) => store.getDoctor(b.doctorId)?.name || '—' },
    { key: 'method', header: 'Paid by', render: (b) => <span className="ad-tag">{b.method}</span> },
    { key: 'total', header: 'Total', render: (b) => <b>{money(b.total)}</b> },
    { key: 'act', header: '', width: 130, render: (b) => (
      <div className="ad-rowact">
        <button title="View" onClick={() => setView(b)}><Eye size={16} /></button>
        <button className="go" title="Print" onClick={() => printPharmacyBill(b, toast)}><Printer size={16} /></button>
        {onLoadCustomer && <button title="Load customer into sell screen" onClick={() => onLoadCustomer(b.customer)}><History size={16} /></button>}
        {user?.role === 'admin' && <button className="danger" title="Delete" onClick={() => setDel(b)}><Trash2 size={16} /></button>}
      </div>
    ) },
  ]

  return (
    <>
      <div className="ad-toolbar">
        <div className="ad-search"><Search size={16} /><input placeholder="Search customer, bill no, medicine…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div className="ad-chips">
          {[['today', 'Today'], ['week', 'This week'], ['month', 'This month'], ['all', 'All']].map(([k, l]) => <button key={k} className={`ad-chip ${range === k ? 'active' : ''}`} onClick={() => setRange(k)}>{l}</button>)}
        </div>
        <span className="ad-tag" style={{ marginLeft: 'auto' }}>{rows.length} bills · {money(rows.reduce((a, b) => a + b.total, 0))}</span>
      </div>
      <DataTable columns={columns} rows={rows} empty="No medicine bills for this filter." />

      <Modal open={!!view} onClose={() => setView(null)} title={view?.no} subtitle={view && `${fmtDate(view.date)} · ${to12h(view.time)} · ${view.createdBy}`} width={520}
        footer={view && <><Button variant="ghost" onClick={() => setView(null)}>Close</Button><Button onClick={() => printPharmacyBill(view, toast)}><Printer size={15} /> Print</Button></>}>
        {view && <PharmacyBillDetail bill={view} />}
      </Modal>

      <ConfirmDialog open={!!del} title="Delete this bill?" message={del && `${del.no} · ${del.customer.name} · ${money(del.total)}. Stock will not be restored.`} confirmLabel="Delete" danger
        onCancel={() => setDel(null)} onConfirm={() => { store.deletePharmacyBill(del.id); setDel(null); toast('Bill deleted', '', 'info') }} />
    </>
  )
}
