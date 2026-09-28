import { useEffect, useState } from 'react'
import { Save, Ruler, Scale, Droplets, HeartPulse, Stethoscope } from 'lucide-react'
import PageHeader from '../../admin/components/PageHeader'
import FormField from '../../admin/components/FormField'
import { Avatar, Badge, Button } from '../../admin/components/ui'
import { useToast } from '../../admin/hooks/useToast'
import { useAuth } from '../hooks/useAuth'
import * as store from '../../services/staffStore'
import { BLOOD_GROUPS } from '../../data/staff'
import { fmtDate } from '../../admin/utils/format'
import { ROLE_LABEL } from '../services/authService'

export const bmi = (h, w) => (h && w ? Math.round((w / ((h / 100) ** 2)) * 10) / 10 : null)
export const bmiLabel = (b) => (!b ? '—' : b < 18.5 ? 'Underweight' : b < 25 ? 'Healthy' : b < 30 ? 'Overweight' : 'Obese')

export default function Profile() {
  const { me } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState(null)

  useEffect(() => {
    if (me && !form) setForm({ phone: me.phone || '', address: me.address || '', dob: me.dob || '', gender: me.gender || '', emergency: { name: '', relation: '', phone: '', ...(me.emergency || {}) }, health: { heightCm: '', weightKg: '', bloodGroup: '', allergies: '', conditions: '', notes: '', ...(me.health || {}) } })
  }, [me, form])

  if (!me || !form) return null
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const setE = (k) => (e) => setForm({ ...form, emergency: { ...form.emergency, [k]: e.target.value } })
  const setH = (k) => (e) => setForm({ ...form, health: { ...form.health, [k]: e.target.value } })
  const b = bmi(Number(form.health.heightCm), Number(form.health.weightKg))

  const save = (e) => {
    e.preventDefault()
    store.updateStaff(me.id, { ...form, health: { ...form.health, heightCm: Number(form.health.heightCm) || '', weightKg: Number(form.health.weightKg) || '' } })
    toast('Profile saved', 'Your details are up to date')
  }

  return (
    <>
      <PageHeader title="My Profile" subtitle="Keep your contact, emergency and health details current.">
        <Button onClick={save}><Save size={16} /> Save changes</Button>
      </PageHeader>

      <div className="ad-card">
        <div className="ad-card__body">
          <div className="st-profile-head">
            <Avatar name={me.name} color={me.color} size="xl" />
            <div style={{ flex: 1 }}>
              <h2>{me.name}</h2>
              <p>{me.designation} · {me.dept} · Employee ID {me.empId}</p>
              <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                <Badge kind="blue">{ROLE_LABEL[me.role]}</Badge>
                {me.doctorId && <Badge kind="violet"><Stethoscope size={12} /> Linked to doctor profile</Badge>}
                <Badge kind={me.active === false ? 'red' : 'green'}>{me.active === false ? 'Inactive' : 'Active'}</Badge>
              </div>
            </div>
            <div className="ad-kv" style={{ border: 'none', padding: 0, flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
              <span>Joined</span><b>{fmtDate(me.joinDate)}</b>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={save} className="ad-grid ad-cols-2" style={{ marginTop: 22 }}>
        <div style={{ display: 'grid', gap: 22, alignContent: 'start' }}>
          <div className="ad-card">
            <div className="ad-card__head"><h3>Personal details</h3></div>
            <div className="ad-card__body ad-form-grid">
              <FormField label="Email"><input value={me.email} disabled /></FormField>
              <FormField label="Phone"><input value={form.phone} onChange={set('phone')} /></FormField>
              <FormField label="Date of birth"><input type="date" value={form.dob} onChange={set('dob')} /></FormField>
              <FormField label="Gender">
                <select value={form.gender} onChange={set('gender')}><option value="">—</option><option>Female</option><option>Male</option><option>Other</option></select>
              </FormField>
              <FormField label="Address" span2><input value={form.address} onChange={set('address')} /></FormField>
            </div>
          </div>

          <div className="ad-card">
            <div className="ad-card__head"><h3>Emergency contact</h3></div>
            <div className="ad-card__body ad-form-grid">
              <FormField label="Name"><input value={form.emergency.name} onChange={setE('name')} /></FormField>
              <FormField label="Relationship"><input value={form.emergency.relation} onChange={setE('relation')} /></FormField>
              <FormField label="Phone" span2><input value={form.emergency.phone} onChange={setE('phone')} /></FormField>
            </div>
          </div>
        </div>

        <div className="ad-card" style={{ alignSelf: 'start' }}>
          <div className="ad-card__head"><h3>Health record</h3><span className="ad-muted" style={{ fontSize: 12.5 }}>Visible to HR only</span></div>
          <div className="ad-card__body">
            <div className="st-health" style={{ marginBottom: 18 }}>
              <div><span><Ruler size={12} /> Height</span><b>{form.health.heightCm || '—'} cm</b></div>
              <div><span><Scale size={12} /> Weight</span><b>{form.health.weightKg || '—'} kg</b></div>
              <div><span><HeartPulse size={12} /> BMI</span><b>{b ?? '—'}</b><span style={{ textTransform: 'none', letterSpacing: 0, marginTop: 2 }}>{bmiLabel(b)}</span></div>
              <div><span><Droplets size={12} /> Blood</span><b>{form.health.bloodGroup || '—'}</b></div>
            </div>
            <div className="ad-form-grid">
              <FormField label="Height (cm)"><input type="number" min="100" max="250" value={form.health.heightCm} onChange={setH('heightCm')} /></FormField>
              <FormField label="Weight (kg)"><input type="number" min="30" max="250" step="0.1" value={form.health.weightKg} onChange={setH('weightKg')} /></FormField>
              <FormField label="Blood group">
                <select value={form.health.bloodGroup} onChange={setH('bloodGroup')}><option value="">—</option>{BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}</select>
              </FormField>
              <FormField label="Allergies"><input value={form.health.allergies} onChange={setH('allergies')} placeholder="None" /></FormField>
              <FormField label="Medical conditions" span2><input value={form.health.conditions} onChange={setH('conditions')} placeholder="None" /></FormField>
              <FormField label="Notes for HR / occupational health" span2><textarea rows="3" value={form.health.notes} onChange={setH('notes')} placeholder="Medication, restrictions, vaccinations…" /></FormField>
            </div>
          </div>
        </div>
      </form>
    </>
  )
}
