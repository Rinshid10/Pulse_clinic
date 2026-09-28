import { useState } from 'react'
import { Plus, Trash2, Megaphone } from 'lucide-react'
import PageHeader from '../../admin/components/PageHeader'
import Modal from '../../admin/components/Modal'
import FormField from '../../admin/components/FormField'
import ConfirmDialog from '../../admin/components/ConfirmDialog'
import { Button, Badge, EmptyState } from '../../admin/components/ui'
import { useStore } from '../../admin/hooks/useStore'
import { useToast } from '../../admin/hooks/useToast'
import { useAuth } from '../hooks/useAuth'
import * as store from '../../services/staffStore'
import { DEPARTMENTS } from '../../data/staff'
import { fmtDate } from '../../admin/utils/format'

const EMPTY = { title: '', body: '', audience: 'all' }

export default function Announcements() {
  const toast = useToast()
  const { user } = useAuth()
  const [list] = useStore(() => store.getAnnouncements(), [])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [del, setDel] = useState(null)

  const submit = () => {
    if (!form.title.trim() || !form.body.trim()) return toast('Title and message are required', '', 'warn')
    store.addAnnouncement({ ...form, by: user.name })
    toast('Announcement posted', form.audience === 'all' ? 'Visible to everyone in the staff portal' : `Visible to ${form.audience}`)
    setOpen(false)
    setForm(EMPTY)
  }

  return (
    <>
      <PageHeader title="Announcements" subtitle="Posted notices appear on every employee's dashboard in the staff portal.">
        <Button onClick={() => setOpen(true)}><Plus size={16} /> New announcement</Button>
      </PageHeader>

      {list.length === 0 && <div className="ad-card"><EmptyState icon={Megaphone} title="No announcements yet." /></div>}
      <div style={{ display: 'grid', gap: 12 }}>
        {list.map((a) => (
          <div className="hr-notice" key={a.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
              <div>
                <h4>{a.title}</h4>
                <small>{fmtDate(a.date)} · {a.by}</small>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Badge kind={a.audience === 'all' ? 'blue' : 'violet'}>{a.audience === 'all' ? 'Everyone' : a.audience}</Badge>
                <button className="ad-iconbtn" style={{ width: 30, height: 30 }} title="Delete" onClick={() => setDel(a)}><Trash2 size={15} /></button>
              </div>
            </div>
            <p>{a.body}</p>
          </div>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="New announcement" width={520}
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit}>Post</Button></>}>
        <div className="ad-form-grid">
          <FormField label="Title" span2><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus /></FormField>
          <FormField label="Audience" span2>
            <select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
              <option value="all">Everyone</option>
              {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </FormField>
          <FormField label="Message" span2><textarea rows="5" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></FormField>
        </div>
      </Modal>

      <ConfirmDialog open={!!del} title="Delete announcement?" message={del?.title} confirmLabel="Delete" danger
        onCancel={() => setDel(null)} onConfirm={() => { store.deleteAnnouncement(del.id); setDel(null); toast('Deleted', '', 'info') }} />
    </>
  )
}
