import { useState } from 'react'
import { Save, Plus, Trash2, CalendarDays } from 'lucide-react'
import PageHeader from '../../admin/components/PageHeader'
import FormField from '../../admin/components/FormField'
import { Button } from '../../admin/components/ui'
import { useStore } from '../../admin/hooks/useStore'
import { useToast } from '../../admin/hooks/useToast'
import * as store from '../../services/staffStore'
import { LEAVE_TYPES } from '../../data/staff'
import { fmtDate } from '../../admin/utils/format'

export default function LeavePolicy() {
  const toast = useToast()
  const [policy] = useStore(() => store.getLeavePolicy(), [])
  const [holidays] = useStore(() => store.getHolidays(), [])
  const [form, setForm] = useState(null)
  const [holiday, setHoliday] = useState({ date: store.TODAY, name: '' })
  const quotas = form || policy

  const save = () => {
    store.saveLeavePolicy(Object.fromEntries(Object.entries(quotas).map(([k, v]) => [k, Number(v) || 0])))
    setForm(null)
    toast('Leave policy saved', 'Applies to new employees and anyone without a custom quota')
  }
  const addHoliday = () => {
    if (!holiday.name.trim()) return toast('Name the holiday', '', 'warn')
    store.addHoliday(holiday)
    setHoliday({ date: store.TODAY, name: '' })
    toast('Holiday added', holiday.name)
  }

  return (
    <>
      <PageHeader title="Leave policy" subtitle="Default annual quotas per leave type and the public holiday calendar.">
        <Button onClick={save} disabled={!form}><Save size={16} /> Save quotas</Button>
      </PageHeader>

      <div className="ad-grid ad-cols-2">
        <div className="ad-card">
          <div className="ad-card__head"><h3>Default quotas (days per year)</h3></div>
          <div className="ad-card__body ad-form-grid">
            {Object.entries(LEAVE_TYPES).filter(([, v]) => v.quota).map(([k, v]) => (
              <FormField key={k} label={v.label}>
                <input type="number" min="0" value={quotas[k] ?? v.quota} onChange={(e) => setForm({ ...quotas, [k]: e.target.value })} />
              </FormField>
            ))}
            <p className="ad-muted ad-span2" style={{ fontSize: 12.5 }}>
              Per-employee quotas can be changed in Employees. Unpaid leave has no quota. Sick leave over one day needs a medical certificate.
              A leave's return date skips weekends and the holidays listed here.
            </p>
          </div>
        </div>

        <div className="ad-card">
          <div className="ad-card__head"><h3><CalendarDays size={15} style={{ verticalAlign: -2 }} /> Public holidays</h3></div>
          <div className="ad-card__body">
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <input type="date" value={holiday.date} onChange={(e) => setHoliday({ ...holiday, date: e.target.value })} className="ad-select" />
              <input value={holiday.name} onChange={(e) => setHoliday({ ...holiday, name: e.target.value })} placeholder="Holiday name" className="ad-select" style={{ flex: 1, fontWeight: 500 }} onKeyDown={(e) => e.key === 'Enter' && addHoliday()} />
              <Button onClick={addHoliday}><Plus size={15} /> Add</Button>
            </div>
            {holidays.length === 0 && <p className="ad-muted">No holidays yet.</p>}
            {holidays.map((h) => (
              <div className="ad-kv" key={h.id}>
                <span><b>{fmtDate(h.date)}</b> · {h.name}{h.date < store.TODAY && <small className="ad-muted"> · past</small>}</span>
                <button className="ad-iconbtn" style={{ width: 28, height: 28 }} title="Remove" onClick={() => { store.deleteHoliday(h.id); toast('Holiday removed', h.name, 'info') }}><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
