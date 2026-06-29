import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Power, Star, Search } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import FormField from '../components/FormField'
import { Avatar, Badge, Button } from '../components/ui'
import { useStore } from '../hooks/useStore'
import { useToast } from '../hooks/useToast'
import * as svc from '../services/doctorService'
import { DEPARTMENTS, DOCTOR_STATUS } from '../utils/constants'
import { money } from '../utils/format'

const BLANK = { name: '', specialty: 'Cardiology', title: '', fee: 150, experience: 5, room: 'A-100', phone: '', email: '', color: '#4f6cf7', bio: '', languages: 'English' }

export default function Doctors() {
  const toast = useToast()
  const [doctors, refresh] = useStore(() => svc.listDoctors(), [])
  const [q, setQ] = useState('')
  const [dept, setDept] = useState('All')
  const [modal, setModal] = useState(null) // { mode:'add'|'edit', data }
  const [confirm, setConfirm] = useState(null)

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase()
    return doctors.filter(
      (d) => (dept === 'All' || d.specialty === dept) && (d.name + d.specialty + d.title).toLowerCase().includes(query)
    )
  }, [doctors, q, dept])

  const openAdd = () => setModal({ mode: 'add', data: { ...BLANK } })
  const openEdit = (d) => setModal({ mode: 'edit', data: { ...d, languages: (d.languages || []).join(', ') } })

  const save = () => {
    const d = modal.data
    if (!d.name.trim()) return toast('Name required', 'Enter the doctor name', 'warn')
    const payload = {
      ...d,
      fee: Number(d.fee) || 0,
      experience: Number(d.experience) || 0,
      languages: String(d.languages).split(',').map((s) => s.trim()).filter(Boolean),
      shift: d.shift || '09:00 – 17:00',
    }
    if (modal.mode === 'add') {
      svc.createDoctor(payload)
      toast('Doctor added', `${payload.name} joined the team`)
    } else {
      svc.editDoctor(d.id, payload)
      toast('Doctor updated', payload.name)
    }
    setModal(null)
    refresh()
  }

  const toggle = (d) => {
    svc.toggleActive(d.id, !d.active)
    toast(d.active ? 'Doctor deactivated' : 'Doctor activated', `${d.name} is now ${d.active ? 'hidden from' : 'visible on'} the website`, d.active ? 'warn' : 'success')
    refresh()
  }

  const doDelete = () => {
    svc.removeDoctor(confirm.id)
    toast('Doctor removed', confirm.name, 'warn')
    setConfirm(null)
    refresh()
  }

  const set = (k) => (e) => setModal((m) => ({ ...m, data: { ...m.data, [k]: e.target.value } }))

  const columns = [
    {
      key: 'name', header: 'Doctor', render: (d) => (
        <div className="ad-cell-user">
          <Avatar name={d.name} color={d.color} />
          <div><b>{d.name}</b><br /><small>{d.title}</small></div>
        </div>
      ),
    },
    { key: 'specialty', header: 'Department', render: (d) => <span className="ad-tag">{d.specialty}</span> },
    { key: 'rating', header: 'Rating', render: (d) => <span style={{ fontWeight: 700, color: 'var(--ad-amber)' }}><Star size={13} fill="currentColor" style={{ verticalAlign: -2 }} /> {d.rating}</span> },
    { key: 'fee', header: 'Fee', render: (d) => <b>{money(d.fee)}</b> },
    {
      key: 'active', header: 'Status', render: (d) =>
        d.active ? <Badge kind="green">Active</Badge> : <Badge kind="gray">Inactive</Badge>,
    },
    {
      key: 'actions', header: '', width: 140, render: (d) => (
        <div className="ad-rowact">
          <button className="go" title={d.active ? 'Deactivate' : 'Activate'} onClick={() => toggle(d)}><Power size={15} /></button>
          <button title="Edit" onClick={() => openEdit(d)}><Pencil size={15} /></button>
          <button className="danger" title="Delete" onClick={() => setConfirm(d)}><Trash2 size={15} /></button>
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader title="Doctors" subtitle={`${doctors.length} doctors · ${doctors.filter((d) => d.active).length} active`}>
        <Button onClick={openAdd}><Plus size={16} /> Add doctor</Button>
      </PageHeader>

      <div className="ad-toolbar">
        <div className="ad-search" style={{ marginLeft: 0 }}>
          <Search size={16} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search doctors…" />
        </div>
        <div className="ad-chips">
          {['All', ...DEPARTMENTS].map((s) => (
            <button key={s} className={`ad-chip ${dept === s ? 'active' : ''}`} onClick={() => setDept(s)}>{s}</button>
          ))}
        </div>
      </div>

      <DataTable columns={columns} rows={rows} empty="No doctors match your filters." />

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === 'add' ? 'Add doctor' : 'Edit doctor'}
        subtitle="Details appear on the customer website."
        footer={<>
          <Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
          <Button onClick={save}>{modal?.mode === 'add' ? 'Add doctor' : 'Save changes'}</Button>
        </>}
      >
        {modal && (
          <div className="ad-form-grid">
            <FormField label="Full name"><input value={modal.data.name} onChange={set('name')} placeholder="Dr. Jane Doe" /></FormField>
            <FormField label="Title"><input value={modal.data.title} onChange={set('title')} placeholder="Senior Cardiologist" /></FormField>
            <FormField label="Department">
              <select value={modal.data.specialty} onChange={set('specialty')}>
                {DEPARTMENTS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </FormField>
            <FormField label="Consultation fee ($)"><input type="number" value={modal.data.fee} onChange={set('fee')} /></FormField>
            <FormField label="Experience (years)"><input type="number" value={modal.data.experience} onChange={set('experience')} /></FormField>
            <FormField label="Room"><input value={modal.data.room} onChange={set('room')} /></FormField>
            <FormField label="Phone"><input value={modal.data.phone} onChange={set('phone')} placeholder="+1 (415) 555-0000" /></FormField>
            <FormField label="Email"><input value={modal.data.email} onChange={set('email')} placeholder="name@pulseclinic.com" /></FormField>
            <FormField label="Languages (comma separated)"><input value={modal.data.languages} onChange={set('languages')} placeholder="English, Spanish" /></FormField>
            <FormField label="Accent color">
              <input type="color" value={modal.data.color} onChange={set('color')} style={{ height: 40, padding: 4 }} />
            </FormField>
            <FormField label="Bio" span2><textarea rows="3" value={modal.data.bio} onChange={set('bio')} placeholder="Short professional bio…" /></FormField>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        danger
        title="Remove doctor?"
        message={`${confirm?.name} will be permanently removed from the clinic and the website.`}
        confirmLabel="Remove"
        onConfirm={doDelete}
        onCancel={() => setConfirm(null)}
      />
    </>
  )
}
