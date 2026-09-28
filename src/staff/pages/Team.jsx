import { useMemo, useState } from 'react'
import { Plus, Pencil, UserX, UserCheck, Search, Eye } from 'lucide-react'
import PageHeader from '../../admin/components/PageHeader'
import DataTable from '../../admin/components/DataTable'
import Modal from '../../admin/components/Modal'
import FormField from '../../admin/components/FormField'
import { Button, Badge } from '../../admin/components/ui'
import { useToast } from '../../admin/hooks/useToast'
import { useStore } from '../../admin/hooks/useStore'
import { useAuth } from '../hooks/useAuth'
import * as store from '../../services/staffStore'
import { DEPARTMENTS, STAFF_ROLES, LEAVE_TYPES, BLOOD_GROUPS } from '../../data/staff'
import { getDoctors } from '../../services/clinicStore'
import { money, fmtDate } from '../../admin/utils/format'
import { StaffCell } from '../components/common'
import { bmi, bmiLabel } from './Profile'

const COLORS = ['#10c8a3', '#4f6cf7', '#f59e0b', '#a855f7', '#ef4444', '#0ea5e9']
const blank = () => ({
  name: '', email: '', password: 'staff123', role: 'staff', dept: DEPARTMENTS[0], designation: '', phone: '', joinDate: store.TODAY, doctorId: '',
  empId: `PC-${1000 + Math.floor(Math.random() * 9000)}`, color: COLORS[Math.floor(Math.random() * COLORS.length)],
  salary: { basic: 3000, hra: 600, allowances: 200, deductions: 180, otRate: 25 },
  leaveQuota: store.defaultQuota(),
  health: { heightCm: '', weightKg: '', bloodGroup: '', allergies: '', conditions: '', notes: '' },
  emergency: { name: '', relation: '', phone: '' },
})

export default function Team() {
  const { user } = useAuth()
  const toast = useToast()
  const [staff] = useStore(() => store.getStaff(), [])
  const [q, setQ] = useState('')
  const [dept, setDept] = useState('all')
  const [edit, setEdit] = useState(null)
  const [view, setView] = useState(null)
  const doctors = useMemo(() => getDoctors(), [])

  const rows = useMemo(() => staff.filter((s) =>
    (dept === 'all' || s.dept === dept) &&
    (!q || `${s.name} ${s.email} ${s.designation} ${s.empId}`.toLowerCase().includes(q.toLowerCase())),
  ), [staff, q, dept])

  const save = () => {
    if (!edit.name.trim() || !edit.email.trim()) return toast('Name and email are required', '', 'warn')
    const patch = {
      ...edit, email: edit.email.trim().toLowerCase(), doctorId: edit.doctorId || undefined,
      salary: Object.fromEntries(Object.entries(edit.salary).map(([k, v]) => [k, Number(v) || 0])),
      leaveQuota: Object.fromEntries(Object.entries(edit.leaveQuota).map(([k, v]) => [k, Number(v) || 0])),
    }
    if (edit.id) { store.updateStaff(edit.id, patch); toast('Staff updated', edit.name) }
    else { store.addStaff(patch); toast('Staff added', `${edit.name} can now sign in`) }
    setEdit(null)
  }

  const setS = (k) => (e) => setEdit({ ...edit, [k]: e.target.value })
  const setN = (group, k) => (e) => setEdit({ ...edit, [group]: { ...edit[group], [k]: e.target.value } })

  const columns = [
    { key: 'name', header: 'Staff', render: (s) => <StaffCell staff={s} sub={`${s.empId} · ${s.email}`} /> },
    { key: 'dept', header: 'Department', render: (s) => <>{s.dept}<br /><small className="ad-muted">{s.designation}</small></> },
    { key: 'role', header: 'Role', render: (s) => <Badge kind={s.role === 'staff' ? 'gray' : 'blue'}>{STAFF_ROLES[s.role]}</Badge> },
    { key: 'salary', header: 'Basic / OT rate', render: (s) => <>{money(s.salary?.basic)}<br /><small className="ad-muted">{money(s.salary?.otRate)}/h</small></> },
    { key: 'leave', header: 'Leave left', render: (s) => { const b = store.leaveBalance(s.id); return <span>{b.find((x) => x.type === 'annual')?.left} annual · {b.find((x) => x.type === 'sick')?.left} sick</span> } },
    { key: 'status', header: 'Status', render: (s) => <Badge kind={s.active === false ? 'red' : 'green'}>{s.active === false ? 'Inactive' : 'Active'}</Badge> },
    { key: 'act', header: '', width: 120, render: (s) => (
      <div className="ad-rowact">
        <button title="View" onClick={() => setView(s)}><Eye size={16} /></button>
        <button className="go" title="Edit" onClick={() => setEdit({ ...blank(), ...s, doctorId: s.doctorId || '' })}><Pencil size={16} /></button>
        {s.id !== user.id && (
          <button className={s.active === false ? 'go' : 'danger'} title={s.active === false ? 'Reactivate' : 'Deactivate'} onClick={() => { store.setStaffActive(s.id, s.active === false); toast(s.active === false ? 'Reactivated' : 'Deactivated', s.name, 'info') }}>
            {s.active === false ? <UserCheck size={16} /> : <UserX size={16} />}
          </button>
        )}
      </div>
    ) },
  ]

  const b = view ? bmi(view.health?.heightCm, view.health?.weightKg) : null

  return (
    <>
      <PageHeader title="Team" subtitle={`${staff.filter((s) => s.active !== false).length} active staff across ${new Set(staff.map((s) => s.dept)).size} departments.`}>
        <Button onClick={() => setEdit(blank())}><Plus size={16} /> Add staff</Button>
      </PageHeader>

      <div className="ad-toolbar">
        <div className="ad-search"><Search size={16} /><input placeholder="Search name, email, ID…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div className="ad-chips">
          {['all', ...new Set(staff.map((s) => s.dept))].map((d) => <button key={d} className={`ad-chip ${dept === d ? 'active' : ''}`} onClick={() => setDept(d)}>{d}</button>)}
        </div>
      </div>

      <DataTable columns={columns} rows={rows} empty="No staff match." />

      {/* view */}
      <Modal open={!!view} onClose={() => setView(null)} title={view?.name} subtitle={view && `${view.designation} · ${view.dept} · ${view.empId}`} width={560}>
        {view && (
          <div className="ad-grid ad-cols-2" style={{ gap: 18 }}>
            <div>
              <h4 className="ad-muted" style={{ fontSize: 12, textTransform: 'uppercase', marginBottom: 6 }}>Contact</h4>
              <div className="ad-kv"><span>Email</span><b>{view.email}</b></div>
              <div className="ad-kv"><span>Phone</span><b>{view.phone || '—'}</b></div>
              <div className="ad-kv"><span>Joined</span><b>{fmtDate(view.joinDate)}</b></div>
              <div className="ad-kv"><span>Address</span><b style={{ textAlign: 'right' }}>{view.address || '—'}</b></div>
              <h4 className="ad-muted" style={{ fontSize: 12, textTransform: 'uppercase', margin: '14px 0 6px' }}>Emergency contact</h4>
              <div className="ad-kv"><span>{view.emergency?.name || '—'}</span><b>{view.emergency?.relation}</b></div>
              <div className="ad-kv"><span>Phone</span><b>{view.emergency?.phone || '—'}</b></div>
            </div>
            <div>
              <h4 className="ad-muted" style={{ fontSize: 12, textTransform: 'uppercase', marginBottom: 6 }}>Health</h4>
              <div className="ad-kv"><span>Height / weight</span><b>{view.health?.heightCm || '—'} cm · {view.health?.weightKg || '—'} kg</b></div>
              <div className="ad-kv"><span>BMI</span><b>{b ?? '—'} {b && <small className="ad-muted">({bmiLabel(b)})</small>}</b></div>
              <div className="ad-kv"><span>Blood group</span><b>{view.health?.bloodGroup || '—'}</b></div>
              <div className="ad-kv"><span>Allergies</span><b>{view.health?.allergies || '—'}</b></div>
              <div className="ad-kv"><span>Conditions</span><b>{view.health?.conditions || '—'}</b></div>
              {view.health?.notes && <p className="st-note" style={{ marginTop: 10 }}>{view.health.notes}</p>}
            </div>
          </div>
        )}
      </Modal>

      {/* add / edit */}
      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'Edit staff' : 'Add staff'} subtitle="Profile, access, salary structure and leave quota." width={680}
        footer={<><Button variant="ghost" onClick={() => setEdit(null)}>Cancel</Button><Button onClick={save}>Save</Button></>}>
        {edit && (
          <div style={{ display: 'grid', gap: 18 }}>
            <div className="ad-form-grid">
              <FormField label="Full name"><input value={edit.name} onChange={setS('name')} /></FormField>
              <FormField label="Employee ID"><input value={edit.empId} onChange={setS('empId')} /></FormField>
              <FormField label="Email (login)"><input type="email" value={edit.email} onChange={setS('email')} /></FormField>
              <FormField label="Password"><input value={edit.password} onChange={setS('password')} /></FormField>
              <FormField label="Department"><select value={edit.dept} onChange={setS('dept')}>{DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}</select></FormField>
              <FormField label="Designation"><input value={edit.designation} onChange={setS('designation')} placeholder="Staff Nurse" /></FormField>
              <FormField label="Portal role"><select value={edit.role} onChange={setS('role')}>{Object.entries(STAFF_ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></FormField>
              <FormField label="Linked doctor (optional)">
                <select value={edit.doctorId} onChange={setS('doctorId')}><option value="">Not a doctor</option>{doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
              </FormField>
              <FormField label="Phone"><input value={edit.phone} onChange={setS('phone')} /></FormField>
              <FormField label="Join date"><input type="date" value={edit.joinDate} onChange={setS('joinDate')} /></FormField>
            </div>

            <div>
              <h4 style={{ fontSize: 13, fontWeight: 800, marginBottom: 8 }}>Salary structure (monthly)</h4>
              <div className="ad-form-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                {[['basic', 'Basic'], ['hra', 'HRA'], ['allowances', 'Allowances'], ['deductions', 'Deductions'], ['otRate', 'OT rate / h']].map(([k, l]) => (
                  <FormField key={k} label={l}><input type="number" min="0" value={edit.salary[k]} onChange={setN('salary', k)} /></FormField>
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: 13, fontWeight: 800, marginBottom: 8 }}>Leave quota (days / year)</h4>
              <div className="ad-form-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                {Object.entries(LEAVE_TYPES).filter(([, v]) => v.quota).map(([k, v]) => (
                  <FormField key={k} label={v.label}><input type="number" min="0" value={edit.leaveQuota[k] ?? v.quota} onChange={setN('leaveQuota', k)} /></FormField>
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: 13, fontWeight: 800, marginBottom: 8 }}>Health record</h4>
              <div className="ad-form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <FormField label="Height (cm)"><input type="number" value={edit.health.heightCm} onChange={setN('health', 'heightCm')} /></FormField>
                <FormField label="Weight (kg)"><input type="number" value={edit.health.weightKg} onChange={setN('health', 'weightKg')} /></FormField>
                <FormField label="Blood group"><select value={edit.health.bloodGroup} onChange={setN('health', 'bloodGroup')}><option value="">—</option>{BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}</select></FormField>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
