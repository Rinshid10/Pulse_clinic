import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Printer, Eye, Trash2, DollarSign, Receipt, BadgeCheck, CalendarDays, X } from 'lucide-react'
import PageHeader from '../../admin/components/PageHeader'
import DataTable from '../../admin/components/DataTable'
import Modal from '../../admin/components/Modal'
import FormField from '../../admin/components/FormField'
import StatCard from '../../admin/components/StatCard'
import ConfirmDialog from '../../admin/components/ConfirmDialog'
import { Avatar, Badge, Button } from '../../admin/components/ui'
import { useToast } from '../../admin/hooks/useToast'
import { useStore } from '../../admin/hooks/useStore'
import { useAuth } from '../hooks/useAuth'
import * as store from '../../services/billingStore'
import { money, fmtDate, to12h } from '../../admin/utils/format'
import { printHtml, esc } from '../../admin/utils/print'

export function ValidityBadge({ bill }) {
  if (bill.type === 'follow-up') return <Badge kind="violet">Free follow-up</Badge>
  if (bill.total <= 0) return <Badge kind="gray">—</Badge>
  const until = store.validUntil(bill)
  const left = store.daysBetween(store.TODAY, until)
  if (left < 0) return <Badge kind="gray">Expired {fmtDate(until)}</Badge>
  return <Badge kind="green">Free until {fmtDate(until)}{left === 0 ? ' (today)' : ` · ${left}d`}</Badge>
}

export function billHtml(bill) {
  const doc = store.getDoctor(bill.doctorId)
  const until = store.validUntil(bill)
  return `
    <div class="head"><div><h1>Pulse Clinic</h1><h2>Consultation bill</h2></div><div style="text-align:right"><h1>${esc(bill.no)}</h1><h2>${fmtDate(bill.date)} · ${to12h(bill.time)}</h2></div></div>
    <div class="meta">
      <div><b>Patient</b>${esc(bill.patient.name)}${bill.patient.age ? `, ${bill.patient.age} yrs` : ''}${bill.patient.gender ? ` · ${esc(bill.patient.gender)}` : ''}</div>
      <div><b>Phone</b>${esc(bill.patient.phone || '—')}</div>
      <div><b>Doctor</b>${esc(doc?.name || '—')}<br><span style="color:#8a93ab">${esc(doc?.specialty || '')}</span></div>
      <div><b>Visit type</b>${bill.type === 'follow-up' ? 'Follow-up (free)' : 'Consultation'}</div>
      <div><b>Payment</b>${esc(bill.method)}</div><div><b>Billed by</b>${esc(bill.createdBy || '')}</div>
    </div>
    <table><thead><tr><th>Item</th><th class="r">Amount</th></tr></thead><tbody>
      ${bill.items.map((i) => `<tr><td>${esc(i.label)}</td><td class="r">${money(i.amount)}</td></tr>`).join('')}
    </tbody></table>
    <table class="tot" style="margin-top:8px"><tbody>
      ${bill.discount ? `<tr><td>Discount</td><td class="r">- ${money(bill.discount)}</td></tr>` : ''}
      <tr class="grand"><td>Total paid</td><td class="r">${money(bill.total)}</td></tr>
    </tbody></table>
    ${bill.type === 'consultation' && bill.total > 0 ? `<div class="note valid">✓ Free follow-up with ${esc(doc?.name || 'the doctor')} valid until ${fmtDate(until)} (${store.VALIDITY_DAYS} days).</div>` : ''}
    ${bill.note ? `<div class="note">${esc(bill.note)}</div>` : ''}
    <div class="foot">Thank you for choosing Pulse Clinic · Get well soon</div>`
}

export default function Bills() {
  const toast = useToast()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [bills] = useStore(() => store.getBills(), [])
  const [summary] = useStore(() => store.billingSummary(), [])
  const [doctors] = useStore(() => store.getDoctors(), [])
  const [range, setRange] = useState('today')
  const [q, setQ] = useState('')
  const [doctorF, setDoctorF] = useState('all')
  const [view, setView] = useState(null)
  const [history, setHistory] = useState(null)
  const [del, setDel] = useState(null)

  const rows = useMemo(() => bills
    .filter((b) => store.inRange(b.date, range))
    .filter((b) => doctorF === 'all' || b.doctorId === doctorF)
    .filter((b) => !q || `${b.patient.name} ${b.no} ${b.patient.phone}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time)), [bills, range, doctorF, q])
  const rowsTotal = rows.reduce((a, b) => a + b.total, 0)

  const print = (bill) => { if (!printHtml(`Bill ${bill.no}`, billHtml(bill))) toast('Pop-up blocked', 'Allow pop-ups to print', 'warn') }

  const columns = [
    { key: 'no', header: 'Bill', render: (b) => <><b>{b.no}</b><br /><small className="ad-muted">{fmtDate(b.date)} · {to12h(b.time)}</small></> },
    { key: 'patient', header: 'Patient', render: (b) => (
      <div className="ad-cell-user">
        <Avatar name={b.patient.name} color="#4f6cf7" size="sm" />
        <div><b>{b.patient.name}</b><small>{b.patient.age ? `${b.patient.age} yrs` : ''}{b.patient.gender ? ` · ${b.patient.gender}` : ''}{b.patient.phone ? ` · ${b.patient.phone}` : ''}</small></div>
      </div>
    ) },
    { key: 'doctor', header: 'Doctor', render: (b) => { const d = store.getDoctor(b.doctorId); return d ? <>{d.name}<br /><small className="ad-muted">{d.specialty}</small></> : '—' } },
    { key: 'type', header: 'Visit', render: (b) => b.type === 'follow-up' ? <Badge kind="violet">Follow-up</Badge> : <Badge kind="blue">Consultation</Badge> },
    { key: 'validity', header: 'Free visit validity', render: (b) => <ValidityBadge bill={b} /> },
    { key: 'method', header: 'Paid by', render: (b) => <span className="ad-tag">{b.method}</span> },
    { key: 'total', header: 'Total', render: (b) => <b>{money(b.total)}</b> },
    { key: 'act', header: '', width: 130, render: (b) => (
      <div className="ad-rowact">
        <button title="View" onClick={() => setView(b)}><Eye size={16} /></button>
        <button className="go" title="Print" onClick={() => print(b)}><Printer size={16} /></button>
        <button title="Patient history" onClick={() => setHistory(b.patient.name)}><CalendarDays size={16} /></button>
        {user?.role === 'admin' && <button className="danger" title="Delete" onClick={() => setDel(b)}><Trash2 size={16} /></button>}
      </div>
    ) },
  ]

  const hist = history ? store.patientBills(history) : []

  return (
    <>
      <PageHeader title="Billing" subtitle={`Consultation bills. A paid visit gives a free follow-up with the same doctor for ${store.VALIDITY_DAYS} days.`}>
        <Button onClick={() => navigate('/billing/new')}><Plus size={16} /> New bill</Button>
      </PageHeader>

      <div className="ad-grid ad-stats" style={{ marginBottom: 18 }}>
        <StatCard index={0} icon={DollarSign} tone="brand" value={money(summary.today)} label={`Collected today · ${summary.todayCount} bill${summary.todayCount === 1 ? '' : 's'}`} trend={`${summary.todayFollowUps} free follow-up${summary.todayFollowUps === 1 ? '' : 's'}`} up />
        <StatCard index={1} icon={Receipt} tone="green" value={money(summary.month)} label="This month (consultations)" trend={`week ${money(summary.week)}`} up />
        <StatCard index={2} icon={BadgeCheck} tone="violet" value={summary.todayFollowUps} label="Free follow-ups today" trend={`${store.VALIDITY_DAYS}-day validity`} up />
        <StatCard index={3} icon={DollarSign} tone="amber" value={money(summary.all)} label="All-time collections" trend={`${summary.count} bills`} up />
      </div>

      {summary.byDoctor.length > 0 && (
        <div className="ad-card" style={{ marginBottom: 18 }}>
          <div className="ad-card__head"><h3>Today by doctor</h3><span className="ad-muted" style={{ fontSize: 12.5 }}>{Object.entries(summary.byMethod).map(([m, v]) => `${m} ${money(v)}`).join(' · ')}</span></div>
          <div className="ad-card__body" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {summary.byDoctor.map(({ doctor, total }) => (
              <div key={doctor?.id} className="ad-leave-card" style={{ '--lc': doctor?.color, padding: '12px 16px', minWidth: 200 }}>
                <div className="ad-leave-card__top"><Avatar name={doctor?.name || '?'} color={doctor?.color} size="sm" /><div><b>{doctor?.name}</b><br /><span>{doctor?.specialty}</span></div></div>
                <div style={{ fontSize: 20, fontWeight: 800, marginTop: 8 }}>{money(total)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="ad-toolbar">
        <div className="ad-search"><Search size={16} /><input placeholder="Search patient, bill no, phone…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div className="ad-chips">
          {[['today', 'Today'], ['week', 'This week'], ['month', 'This month'], ['all', 'All']].map(([k, l]) => <button key={k} className={`ad-chip ${range === k ? 'active' : ''}`} onClick={() => setRange(k)}>{l}</button>)}
        </div>
        <select value={doctorF} onChange={(e) => setDoctorF(e.target.value)} className="ad-select">
          <option value="all">All doctors</option>
          {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <span className="ad-tag" style={{ marginLeft: 'auto' }}>{rows.length} bills · {money(rowsTotal)}</span>
      </div>

      <DataTable columns={columns} rows={rows} empty="No bills for this filter." />

      {/* ---- view bill ---- */}
      <Modal open={!!view} onClose={() => setView(null)} title={view?.no} subtitle={view && `${fmtDate(view.date)} · ${to12h(view.time)} · billed by ${view.createdBy}`} width={520}
        footer={view && <><Button variant="ghost" onClick={() => setView(null)}>Close</Button><Button onClick={() => print(view)}><Printer size={15} /> Print</Button></>}>
        {view && (
          <div>
            <div className="ad-kv"><span>Patient</span><b>{view.patient.name}{view.patient.age ? `, ${view.patient.age} yrs` : ''}{view.patient.gender ? ` · ${view.patient.gender}` : ''}</b></div>
            <div className="ad-kv"><span>Phone</span><b>{view.patient.phone || '—'}</b></div>
            <div className="ad-kv"><span>Doctor</span><b>{store.getDoctor(view.doctorId)?.name || '—'}</b></div>
            <div className="ad-kv"><span>Visit</span><b>{view.type === 'follow-up' ? 'Follow-up (free)' : 'Consultation'}</b></div>
            <div className="ad-kv"><span>Free visit validity</span><ValidityBadge bill={view} /></div>
            <div style={{ margin: '12px 0 4px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--ad-text-3)', fontWeight: 700 }}>Items</div>
            {view.items.map((i, k) => <div className="ad-kv" key={k}><span>{i.label}</span><b>{money(i.amount)}</b></div>)}
            {view.discount > 0 && <div className="ad-kv"><span>Discount</span><b>- {money(view.discount)}</b></div>}
            <div className="ad-kv" style={{ fontSize: 16 }}><span><b>Total · {view.method}</b></span><b>{money(view.total)}</b></div>
            {view.note && <p className="ad-note" style={{ marginTop: 10 }}>{view.note}</p>}
          </div>
        )}
      </Modal>

      {/* ---- patient history ---- */}
      <Modal open={!!history} onClose={() => setHistory(null)} title={history} subtitle={`${hist.length} visit${hist.length === 1 ? '' : 's'} · ${money(hist.reduce((a, b) => a + b.total, 0))} total`} width={560}>
        <div style={{ display: 'grid', gap: 8 }}>
          {hist.map((b) => (
            <div key={b.id} className="ad-hist">
              <div><b>{b.no}</b> · {fmtDate(b.date)} {to12h(b.time)}<br /><small className="ad-muted">{store.getDoctor(b.doctorId)?.name} · {b.items.map((i) => i.label).join(', ')}</small></div>
              <div style={{ textAlign: 'right' }}><b>{money(b.total)}</b><br /><ValidityBadge bill={b} /></div>
            </div>
          ))}
        </div>
      </Modal>

      <ConfirmDialog open={!!del} title="Delete this bill?" message={del && `${del.no} · ${del.patient.name} · ${money(del.total)}. This cannot be undone.`} confirmLabel="Delete" danger
        onCancel={() => setDel(null)} onConfirm={() => { store.deleteBill(del.id); setDel(null); toast('Bill deleted', '', 'info') }} />
    </>
  )
}
