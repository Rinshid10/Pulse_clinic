import { useEffect, useState } from 'react'
import { Send, PackagePlus, Sparkles } from 'lucide-react'
import Modal from '../../admin/components/Modal'
import FormField from '../../admin/components/FormField'
import { Badge, Button } from '../../admin/components/ui'
import { useToast } from '../../admin/hooks/useToast'
import { useStore } from '../../admin/hooks/useStore'
import { useAuth } from '../hooks/useAuth'
import * as store from '../../services/billingStore'
import { money, fmtDate } from '../../admin/utils/format'

const STATUS = { pending: { label: 'Pending', kind: 'amber' }, approved: { label: 'Approved', kind: 'green' }, rejected: { label: 'Rejected', kind: 'red' } }
export const RequestStatus = ({ status }) => <Badge kind={STATUS[status]?.kind || 'gray'}>{STATUS[status]?.label || status}</Badge>

const blank = (medicineId = '') => ({ kind: medicineId ? 'restock' : 'new', medicineId, qty: 20, name: '', category: 'Tablet', unit: '', price: '', reason: '' })

/** Modal: request a restock of an existing medicine, or suggest a new one. `preset` = medicineId to restock. */
export function RequestMedicineModal({ open, onClose, preset }) {
  const toast = useToast()
  const { user } = useAuth()
  const [meds] = useStore(() => store.getMedicines(), [])
  const [form, setForm] = useState(blank())
  useEffect(() => { if (open) setForm(blank(preset || '')) }, [open, preset])
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const med = meds.find((m) => m.id === form.medicineId)

  const submit = () => {
    if (form.kind === 'restock' && !form.medicineId) return toast('Pick a medicine', '', 'warn')
    if (form.kind === 'new' && !form.name.trim()) return toast('Name the medicine', '', 'warn')
    if (!(Number(form.qty) > 0)) return toast('Enter a quantity', '', 'warn')
    if (!form.reason.trim()) return toast('Add a short reason', 'It helps the admin decide', 'warn')
    store.requestMedicine({ ...form, by: user?.name || 'Pharmacy' })
    toast('Request sent to admin', form.kind === 'new' ? `New: ${form.name}` : `Restock: ${med?.name} × ${form.qty}`)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Request medicine" subtitle="The clinic admin reviews it under Medicine stock." width={520}
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={submit}><Send size={15} /> Send request</Button></>}>
      <div className="ad-form-grid">
        <FormField label="What do you need?" span2>
          <div className="ad-seg">
            <button type="button" className={form.kind === 'restock' ? 'active' : ''} onClick={() => setForm({ ...form, kind: 'restock' })}><PackagePlus size={14} /> Restock existing</button>
            <button type="button" className={form.kind === 'new' ? 'active' : ''} onClick={() => setForm({ ...form, kind: 'new', medicineId: '' })}><Sparkles size={14} /> Suggest new medicine</button>
          </div>
        </FormField>
        {form.kind === 'restock' ? (
          <FormField label="Medicine" span2>
            <select value={form.medicineId} onChange={set('medicineId')}>
              <option value="">Select…</option>
              {[...meds].sort((a, b) => a.stock - b.stock).map((m) => <option key={m.id} value={m.id}>{m.name} — {m.stock <= 0 ? 'out of stock' : `${m.stock} left`}</option>)}
            </select>
          </FormField>
        ) : (
          <>
            <FormField label="Medicine name" span2><input value={form.name} onChange={set('name')} placeholder="e.g. Loratadine 10mg" autoFocus /></FormField>
            <FormField label="Category"><select value={form.category} onChange={set('category')}>{store.MEDICINE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></FormField>
            <FormField label="Unit / pack"><input value={form.unit} onChange={set('unit')} placeholder="strip of 10" /></FormField>
            <FormField label="Expected sale price ($)"><input type="number" min="0" step="0.1" value={form.price} onChange={set('price')} /></FormField>
          </>
        )}
        <FormField label="Quantity"><input type="number" min="1" value={form.qty} onChange={set('qty')} /></FormField>
        <FormField label="Reason" span2><textarea rows="3" value={form.reason} onChange={set('reason')} placeholder={form.kind === 'new' ? 'Why should the clinic stock this?' : 'Running low, high demand, prescription pattern…'} /></FormField>
      </div>
    </Modal>
  )
}

/** List of requests sent from the pharmacy desk, newest first. */
export function MedicineRequestList() {
  const [list] = useStore(() => store.getMedicineRequests(), [])
  if (list.length === 0) return <p className="ad-muted">No requests yet.</p>
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {list.map((r) => (
        <div key={r.id} className="ad-hist">
          <div>
            <b>{r.kind === 'new' ? 'New: ' : 'Restock: '}{r.name}</b> × {r.qty}{r.kind === 'new' && r.price ? ` · ${money(r.price)}` : ''}
            <br /><small className="ad-muted">{r.reason} · {r.by} · {fmtDate(r.date)}{r.decidedBy ? ` · ${r.decidedBy}${r.note ? `: ${r.note}` : ''}` : ''}</small>
          </div>
          <RequestStatus status={r.status} />
        </div>
      ))}
    </div>
  )
}
