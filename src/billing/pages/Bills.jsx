import { useMemo, useState } from 'react'
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

const BLANK = { name: '', age: '', gender: '', phone: '', doctorId: '', extras: [], discount: 0, method: 'Cash', note: '', forceCharge: false }

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
  const { user } = useAuth()
  const [bills] = useStore(() => store.getBills(), [])
  const [summary] = useStore(() => store.billingSummary(), [])
  const [doctors] = useStore(() => store.getDoctors(), [])
  const [known] = useStore(() => store.knownPatients(), [])
  const [range, setRange] = useState('today')
  const [q, setQ] = useState('')
  const [doctorF, setDoctorF] = useState('all')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [view, setView] = useState(null)
  const [history, setHistory] = useState(null)
  const [del, setDel] = useState(null)

  const rows = useMemo(() => bills
    .filter((b) => store.inRange(b.date, range))
    .filter((b) => doctorF === 'all' || b.doctorId === doctorF)
    .filter((b) => !q || `${b.patient.name} ${b.no} ${b.patient.phone}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time)), [bills, range, doctorF, q])
  const rowsTotal = rows.reduce((a, b) => a + b.total, 0)

  /* ---- new bill form ---- */
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  const doc = doctors.find((d) => d.id === form.doctorId)
  const prior = form.name && form.doctorId && !form.forceCharge ? store.activeValidity(form.name, form.doctorId) : null
  const anyPrior = form.name ? store.activeValidity(form.name, null) : null
  const suggestions = form.name.length >= 2 ? known.filter((p) => p.name.toLowerCase().includes(form.name.toLowerCase()) && p.name.toLowerCase() !== form.name.toLowerCase()).slice(0, 5) : []
  const baseFee = prior ? 0 : Number(doc?.fee) || 0
  const extrasTotal = form.extras.reduce((a, e) => a + (Number(e.amount) || 0), 0)
  const total = Math.max(0, baseFee + extrasTotal - (Number(form.discount) || 0))

  const pickPatient = (p) => setForm((f) => ({ ...f, name: p.name, age: p.age ?? '', gender: p.gender || '', phone: p.phone || '', doctorId: f.doctorId || p.lastDoctorId }))
  const setExtra = (i, k, v) => setForm((f) => ({ ...f, extras: f.extras.map((e, j) => (j === i ? { ...e, [k]: v } : e)) }))

  const submit = (e) => {
    e?.preventDefault()
    if (!form.name.trim()) return toast('Patient name required', '', 'warn')
    if (!form.doctorId) return toast('Choose a doctor', '', 'warn')
    const bill = store.createBill({
      patient: { name: form.name, age: form.age, gender: form.gender, phone: form.phone },
      doctorId: form.doctorId, extras: form.extras, discount: form.discount, method: form.method, note: form.note,
      createdBy: user?.name || 'Admin', forceCharge: form.forceCharge,
    })
    toast(bill.type === 'follow-up' ? 'Free follow-up recorded' : 'Bill created', `${bill.no} · ${bill.patient.name} · ${money(bill.total)}`)
    setOpen(false)
    setForm(BLANK)
    setView(bill)
  }

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
        <Button onClick={() => { setForm(BLANK); setOpen(true) }}><Plus size={16} /> New bill</Button>
      </PageHeader>

      <div className="ad-grid ad-stats" style={{ marginBottom: 18 }}>
        <StatCard index={0} icon={DollarSign} tone="brand" value={money(summary.today)} label={`Collected today · ${summary.todayCount} bill${summary.todayCount === 1 ? '' : 's'}`} trend={`${summary.todayFollowUps} free follow-up${summary.todayFollowUps === 1 ? '' : 's'}`} up />
        <StatCard index={1} icon={Receipt} tone="green" value={money(summary.month)} label="This month (consultations)" trend={`week ${money(summary.week)}`} up />
        <StatCard index={2} icon={BadgeCheck} tone="violet" value={money(summary.pharmacyToday)} label="Pharmacy today" trend={`month ${money(summary.pharmacyMonth)}`} up />
        <StatCard index={3} icon={DollarSign} tone="amber" value={money(summary.combinedToday)} label="Total today (clinic + pharmacy)" trend={`all time ${money(summary.all + summary.pharmacyAll)}`} up />
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

      {/* ---- new bill ---- */}
      <Modal open={open} onClose={() => setOpen(false)} title="New consultation bill" subtitle="Enter the patient and the doctor. Validity is checked automatically." width={640}
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit}>Save &amp; view bill · {money(total)}</Button></>}>
        <form onSubmit={submit} className="ad-form-grid">
          <FormField label="Patient name" span2>
            <div style={{ position: 'relative' }}>
              <input value={form.name} onChange={set('name')} placeholder="Start typing to find a returning patient…" autoFocus autoComplete="off" />
              {suggestions.length > 0 && (
                <div className="ad-suggest">
                  {suggestions.map((p) => {
                    const v = store.activeValidity(p.name, null)
                    return (
                      <button type="button" key={p.name} onClick={() => pickPatient(p)}>
                        <b>{p.name}</b><span>{p.age ? `${p.age} yrs · ` : ''}{p.visits} visit{p.visits === 1 ? '' : 's'} · last {fmtDate(p.lastVisit)}</span>
                        {v && <Badge kind="green">Free until {fmtDate(store.validUntil(v))}</Badge>}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </FormField>
          <FormField label="Age"><input type="number" min="0" max="120" value={form.age} onChange={set('age')} /></FormField>
          <FormField label="Gender"><select value={form.gender} onChange={set('gender')}><option value="">—</option><option>Female</option><option>Male</option><option>Other</option></select></FormField>
          <FormField label="Phone"><input value={form.phone} onChange={set('phone')} placeholder="+1 …" /></FormField>
          <FormField label="Doctor">
            <select value={form.doctorId} onChange={set('doctorId')}>
              <option value="">Select doctor…</option>
              {doctors.filter((d) => d.active !== false).map((d) => <option key={d.id} value={d.id}>{d.name} — {d.specialty} ({money(d.fee)})</option>)}
            </select>
          </FormField>

          {prior && (
            <div className="ad-span2 ad-note ad-note--ok">
              <BadgeCheck size={16} /> <div><b>Free follow-up.</b> {form.name} paid {money(prior.total)} on {fmtDate(prior.date)} ({prior.no}) with {doc?.name}. Valid until <b>{fmtDate(store.validUntil(prior))}</b>, so the consultation fee is waived.
                <label style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 6, fontWeight: 600 }}><input type="checkbox" checked={form.forceCharge} onChange={set('forceCharge')} style={{ width: 'auto' }} /> Charge full fee anyway</label></div>
            </div>
          )}
          {!prior && anyPrior && form.doctorId && anyPrior.doctorId !== form.doctorId && (
            <div className="ad-span2 ad-note">Note: {form.name} has a free visit with {store.getDoctor(anyPrior.doctorId)?.name} until {fmtDate(store.validUntil(anyPrior))}. It does not apply to {doc?.name}.</div>
          )}

          <FormField label="Extra items (procedures, tests…)" span2>
            <div style={{ display: 'grid', gap: 8 }}>
              {form.extras.map((ex, i) => (
                <div key={i} style={{ display: 'flex', gap: 8 }}>
                  <input value={ex.label} onChange={(e) => setExtra(i, 'label', e.target.value)} placeholder="e.g. X-ray" style={{ flex: 1 }} />
                  <input type="number" min="0" value={ex.amount} onChange={(e) => setExtra(i, 'amount', e.target.value)} placeholder="Amount" style={{ width: 110 }} />
                  <button type="button" className="ad-iconbtn" onClick={() => setForm((f) => ({ ...f, extras: f.extras.filter((_, j) => j !== i) }))}><X size={15} /></button>
                </div>
              ))}
              <button type="button" className="ad-btn ad-btn--ghost ad-btn--sm" style={{ justifySelf: 'start' }} onClick={() => setForm((f) => ({ ...f, extras: [...f.extras, { label: '', amount: '' }] }))}><Plus size={14} /> Add item</button>
            </div>
          </FormField>
          <FormField label="Discount ($)"><input type="number" min="0" value={form.discount} onChange={set('discount')} /></FormField>
          <FormField label="Payment method"><select value={form.method} onChange={set('method')}>{store.PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}</select></FormField>
          <FormField label="Note (optional)" span2><input value={form.note} onChange={set('note')} placeholder="Printed on the bill" /></FormField>

          <div className="ad-span2 ad-total">
            <div className="ad-kv"><span>{prior ? 'Follow-up visit' : `Consultation fee${doc ? ` · ${doc.name}` : ''}`}</span><b>{money(baseFee)}</b></div>
            {extrasTotal > 0 && <div className="ad-kv"><span>Extra items</span><b>{money(extrasTotal)}</b></div>}
            {Number(form.discount) > 0 && <div className="ad-kv"><span>Discount</span><b>- {money(form.discount)}</b></div>}
            <div className="ad-kv" style={{ fontSize: 16 }}><span><b>Total</b></span><b>{money(total)}</b></div>
            {!prior && baseFee > 0 && <small className="ad-muted">This visit gives a free follow-up with {doc?.name} until {fmtDate(store.addDays(store.TODAY, store.VALIDITY_DAYS))}.</small>}
          </div>
        </form>
      </Modal>

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
