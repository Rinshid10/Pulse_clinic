import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, X, BadgeCheck, Printer, Receipt, CheckCircle2, ArrowRight, UserRound, Stethoscope, CalendarDays } from 'lucide-react'
import PageHeader from '../../admin/components/PageHeader'
import FormField from '../../admin/components/FormField'
import { Avatar, Badge, Button } from '../../admin/components/ui'
import { useToast } from '../../admin/hooks/useToast'
import { useStore } from '../../admin/hooks/useStore'
import { useAuth } from '../hooks/useAuth'
import * as store from '../../services/billingStore'
import { money, fmtDate, to12h } from '../../admin/utils/format'
import { printHtml } from '../../admin/utils/print'
import { billHtml, ValidityBadge } from './Bills'

const BLANK = { name: '', age: '', gender: '', phone: '', doctorId: '', extras: [], discount: 0, method: 'Cash', note: '', forceCharge: false }

export default function NewBill() {
  const toast = useToast()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [doctors] = useStore(() => store.getDoctors().filter((d) => d.active !== false), [])
  const [known] = useStore(() => store.knownPatients(), [])
  const [form, setForm] = useState(BLANK)
  const [saved, setSaved] = useState(null)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  const doc = doctors.find((d) => d.id === form.doctorId)
  const prior = form.name && form.doctorId && !form.forceCharge ? store.activeValidity(form.name, form.doctorId) : null
  const anyPrior = form.name ? store.activeValidity(form.name, null) : null
  const suggestions = form.name.length >= 2 ? known.filter((p) => p.name.toLowerCase().includes(form.name.toLowerCase()) && p.name.toLowerCase() !== form.name.toLowerCase()).slice(0, 5) : []
  const history = form.name.trim().length >= 2 ? store.patientBills(form.name) : []
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
      createdBy: user?.name || 'Billing desk', forceCharge: form.forceCharge,
    })
    toast(bill.type === 'follow-up' ? 'Free follow-up recorded' : 'Bill saved', `${bill.no} · ${bill.patient.name} · ${money(bill.total)}`)
    setSaved(bill)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const print = (bill) => { if (!printHtml(`Bill ${bill.no}`, billHtml(bill))) toast('Pop-up blocked', 'Allow pop-ups to print', 'warn') }

  /* ---------- success screen ---------- */
  if (saved) {
    const d = store.getDoctor(saved.doctorId)
    return (
      <>
        <PageHeader title="Bill saved" subtitle={`${saved.no} · ${fmtDate(saved.date)} · ${to12h(saved.time)}`}>
          <Button variant="ghost" onClick={() => navigate('/billing/bills')}>All bills <ArrowRight size={16} /></Button>
          <Button onClick={() => { setSaved(null); setForm(BLANK) }}><Plus size={16} /> Another bill</Button>
        </PageHeader>
        <div className="ad-grid ad-cols-2">
          <div className="ad-card">
            <div className="ad-card__body" style={{ textAlign: 'center', padding: 36 }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--ad-green-soft)', color: 'var(--ad-green)', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}><CheckCircle2 size={40} /></div>
              <h2 style={{ fontSize: 22, fontWeight: 800 }}>{saved.type === 'follow-up' ? 'Free follow-up recorded' : `${money(saved.total)} collected`}</h2>
              <p className="ad-muted" style={{ marginTop: 6 }}>{saved.patient.name}{saved.patient.age ? `, ${saved.patient.age} yrs` : ''} · {d?.name} · paid by {saved.method}</p>
              <div style={{ marginTop: 14 }}><ValidityBadge bill={saved} /></div>
              {saved.type === 'consultation' && saved.total > 0 && <p className="ad-note ad-note--ok" style={{ marginTop: 18, textAlign: 'left' }}><BadgeCheck size={16} /> <span>Tell the patient: a return visit to {d?.name} is free until <b>{fmtDate(store.validUntil(saved))}</b>.</span></p>}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 22 }}>
                <Button onClick={() => print(saved)}><Printer size={16} /> Print bill</Button>
              </div>
            </div>
          </div>
          <div className="ad-card">
            <div className="ad-card__head"><h3>Bill details</h3><Badge kind="blue">{saved.no}</Badge></div>
            <div className="ad-card__body">
              {saved.items.map((i, k) => <div className="ad-kv" key={k}><span>{i.label}</span><b>{money(i.amount)}</b></div>)}
              {saved.discount > 0 && <div className="ad-kv"><span>Discount</span><b>- {money(saved.discount)}</b></div>}
              <div className="ad-kv" style={{ fontSize: 16 }}><span><b>Total</b></span><b>{money(saved.total)}</b></div>
              {saved.note && <p className="ad-note" style={{ marginTop: 12 }}>{saved.note}</p>}
            </div>
          </div>
        </div>
      </>
    )
  }

  /* ---------- form screen ---------- */
  return (
    <>
      <PageHeader title="New consultation bill" subtitle={`A paid visit gives the patient a free follow-up with the same doctor for ${store.VALIDITY_DAYS} days.`}>
        <Button variant="ghost" onClick={() => navigate('/billing/bills')}>Cancel</Button>
        <Button onClick={submit}><Receipt size={16} /> Save bill · {money(total)}</Button>
      </PageHeader>

      <form onSubmit={submit} className="ad-grid" style={{ gridTemplateColumns: '1.5fr 1fr', alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: 18 }}>
          <div className="ad-card">
            <div className="ad-card__head"><h3><UserRound size={15} style={{ verticalAlign: -2 }} /> Patient</h3><span className="ad-muted" style={{ fontSize: 12.5 }}>Type the name — returning patients show their free-visit status</span></div>
            <div className="ad-card__body ad-form-grid">
              <FormField label="Patient name" span2>
                <div style={{ position: 'relative' }}>
                  <input value={form.name} onChange={set('name')} placeholder="Full name" autoFocus autoComplete="off" />
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
              <FormField label="Phone" span2><input value={form.phone} onChange={set('phone')} placeholder="+1 …" /></FormField>
            </div>
          </div>

          <div className="ad-card">
            <div className="ad-card__head"><h3><Stethoscope size={15} style={{ verticalAlign: -2 }} /> Doctor &amp; charges</h3></div>
            <div className="ad-card__body ad-form-grid">
              <FormField label="Doctor" span2>
                <select value={form.doctorId} onChange={set('doctorId')}>
                  <option value="">Select doctor…</option>
                  {doctors.map((d) => <option key={d.id} value={d.id}>{d.name} — {d.specialty} ({money(d.fee)})</option>)}
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
                      <input type="number" min="0" value={ex.amount} onChange={(e) => setExtra(i, 'amount', e.target.value)} placeholder="Amount" style={{ width: 120 }} />
                      <button type="button" className="ad-iconbtn" onClick={() => setForm((f) => ({ ...f, extras: f.extras.filter((_, j) => j !== i) }))}><X size={15} /></button>
                    </div>
                  ))}
                  <button type="button" className="ad-btn ad-btn--ghost ad-btn--sm" style={{ justifySelf: 'start' }} onClick={() => setForm((f) => ({ ...f, extras: [...f.extras, { label: '', amount: '' }] }))}><Plus size={14} /> Add item</button>
                </div>
              </FormField>
              <FormField label="Discount ($)"><input type="number" min="0" value={form.discount} onChange={set('discount')} /></FormField>
              <FormField label="Payment method"><select value={form.method} onChange={set('method')}>{store.PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}</select></FormField>
              <FormField label="Note (optional)" span2><input value={form.note} onChange={set('note')} placeholder="Printed on the bill" /></FormField>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 18, position: 'sticky', top: 90 }}>
          <div className="ad-card">
            <div className="ad-card__head"><h3><Receipt size={15} style={{ verticalAlign: -2 }} /> Bill preview</h3><span className="ad-muted" style={{ fontSize: 12.5 }}>{fmtDate(store.TODAY)}</span></div>
            <div className="ad-card__body">
              <div className="ad-cell-user" style={{ marginBottom: 12 }}>
                <Avatar name={form.name || '?'} color="#4f6cf7" size="md" />
                <div><b>{form.name || 'Patient name'}</b><small>{form.age ? `${form.age} yrs` : 'Age'}{form.gender ? ` · ${form.gender}` : ''}{form.phone ? ` · ${form.phone}` : ''}</small></div>
              </div>
              <div className="ad-kv"><span>Doctor</span><b>{doc ? doc.name : '—'}</b></div>
              <div className="ad-kv"><span>Visit</span><b>{prior ? 'Follow-up (free)' : 'Consultation'}</b></div>
              <div className="ad-kv"><span>{prior ? 'Follow-up visit' : 'Consultation fee'}</span><b>{money(baseFee)}</b></div>
              {form.extras.filter((e) => e.label).map((e, i) => <div className="ad-kv" key={i}><span>{e.label}</span><b>{money(e.amount)}</b></div>)}
              {Number(form.discount) > 0 && <div className="ad-kv"><span>Discount</span><b>- {money(form.discount)}</b></div>}
              <div className="ad-kv" style={{ fontSize: 18 }}><span><b>Total · {form.method}</b></span><b>{money(total)}</b></div>
              {!prior && baseFee > 0 && <p className="ad-muted" style={{ fontSize: 12.5, marginTop: 10 }}><CalendarDays size={12} /> Free follow-up with {doc?.name} until {fmtDate(store.addDays(store.TODAY, store.VALIDITY_DAYS))}.</p>}
              <Button block type="submit" style={{ marginTop: 14 }}><Receipt size={16} /> Save bill · {money(total)}</Button>
            </div>
          </div>

          <div className="ad-card">
            <div className="ad-card__head"><h3>Patient history</h3>{history.length > 0 && <span className="ad-tag">{history.length} visit{history.length === 1 ? '' : 's'}</span>}</div>
            <div className="ad-card__body" style={{ display: 'grid', gap: 8 }}>
              {form.name.trim().length < 2 && <p className="ad-muted">Enter a name to see previous visits.</p>}
              {form.name.trim().length >= 2 && history.length === 0 && <p className="ad-muted">First visit for “{form.name}”.</p>}
              {history.slice(0, 5).map((b) => (
                <div key={b.id} className="ad-hist">
                  <div><b>{b.no}</b> · {fmtDate(b.date)}<br /><small className="ad-muted">{store.getDoctor(b.doctorId)?.name}</small></div>
                  <div style={{ textAlign: 'right' }}><b>{money(b.total)}</b><br /><ValidityBadge bill={b} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>
    </>
  )
}
