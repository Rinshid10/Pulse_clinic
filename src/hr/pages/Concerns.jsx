import { useMemo, useState } from 'react'
import { Plus, Send, MessageSquareWarning } from 'lucide-react'
import PageHeader from '../../admin/components/PageHeader'
import Modal from '../../admin/components/Modal'
import FormField from '../../admin/components/FormField'
import { Button, Badge, EmptyState } from '../../admin/components/ui'
import { useToast } from '../../admin/hooks/useToast'
import { useStore } from '../../admin/hooks/useStore'
import { useAuth } from '../hooks/useAuth'
import * as store from '../../services/staffStore'
import { CONCERN_CATEGORIES, CONCERN_STATUS } from '../../data/staff'
import { fmtDate } from '../../admin/utils/format'
import { PRIORITY_BADGE } from '../utils/constants'
import { StatusBadge, StaffCell } from '../../components/staff-common'

const EMPTY = { category: CONCERN_CATEGORIES[0], priority: 'medium', subject: '', body: '' }

export default function Concerns() {
  const { user, isManager } = useAuth()
  const toast = useToast()
  const [all] = useStore(() => store.getConcerns(isManager ? undefined : user.id), [user.id, isManager])
  const [staffById] = useStore(() => Object.fromEntries(store.getStaff().map((s) => [s.id, s])), [])
  const [filter, setFilter] = useState('all')
  const [activeId, setActiveId] = useState(null)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [reply, setReply] = useState('')

  const list = useMemo(() => (filter === 'all' ? all : all.filter((c) => c.status === filter)).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [all, filter])
  const active = all.find((c) => c.id === activeId) || list[0] || null

  const submit = (e) => {
    e.preventDefault()
    if (!form.subject.trim() || !form.body.trim()) return toast('Fill in the details', 'A subject and description are required', 'warn')
    const rec = store.raiseConcern({ ...form, staffId: user.id })
    toast('Concern raised', 'HR will respond within 2 working days')
    setOpen(false)
    setForm(EMPTY)
    setActiveId(rec.id)
  }

  const sendReply = () => {
    if (!reply.trim() || !active) return
    store.replyConcern(active.id, user.name, reply.trim())
    if (isManager && active.status === 'open') store.setConcernStatus(active.id, 'in-progress')
    setReply('')
  }

  return (
    <>
      <PageHeader title="Concerns" subtitle="Every concern raised by the team. Reply and update the status.">
        <Button onClick={() => setOpen(true)}><Plus size={16} /> Raise a concern</Button>
      </PageHeader>

      <div className="ad-toolbar">
        <div className="ad-chips">
          {['all', ...Object.keys(CONCERN_STATUS)].map((s) => (
            <button key={s} className={`ad-chip ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>{s === 'all' ? 'all' : CONCERN_STATUS[s].label}</button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <div className="ad-card"><EmptyState icon={MessageSquareWarning} title="No concerns here." /></div>
      ) : (
        <div className="ad-grid" style={{ gridTemplateColumns: 'minmax(280px, 1fr) 1.6fr' }}>
          <div className="st-list">
            {list.map((c) => (
              <div key={c.id} className={`st-ticket ${active?.id === c.id ? 'active' : ''}`} onClick={() => setActiveId(c.id)}>
                <div className="st-ticket__body">
                  <b>{c.subject}</b>
                  <span>{isManager ? `${staffById[c.staffId]?.name || 'Staff'} · ` : ''}{c.category} · {fmtDate(c.createdAt)}</span>
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    <StatusBadge status={c.status} />
                    <Badge kind={PRIORITY_BADGE[c.priority]}>{c.priority}</Badge>
                    {c.replies?.length > 0 && <span className="ad-tag">{c.replies.length} repl{c.replies.length === 1 ? 'y' : 'ies'}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {active && (
            <div className="ad-card">
              <div className="ad-card__head" style={{ alignItems: 'flex-start' }}>
                <div>
                  <h3>{active.subject}</h3>
                  <p className="ad-muted" style={{ fontSize: 12.5, marginTop: 4 }}>{active.category} · raised {fmtDate(active.createdAt)}</p>
                </div>
                {isManager ? (
                  <select value={active.status} onChange={(e) => { store.setConcernStatus(active.id, e.target.value); toast('Status updated', CONCERN_STATUS[e.target.value].label, 'info') }} style={{ width: 'auto' }}>
                    {Object.entries(CONCERN_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                ) : <StatusBadge status={active.status} />}
              </div>
              <div className="ad-card__body">
                {isManager && <div style={{ marginBottom: 14 }}><StaffCell staff={staffById[active.staffId]} /></div>}
                <div className="st-thread">
                  <div className={`st-msg ${active.staffId === user.id ? 'mine' : ''}`}>
                    <b>{staffById[active.staffId]?.name || 'Staff'}<small>{fmtDate(active.createdAt)}</small></b>
                    {active.body}
                  </div>
                  {(active.replies || []).map((r, i) => (
                    <div key={i} className={`st-msg ${r.by === user.name ? 'mine' : ''}`}>
                      <b>{r.by}<small>{fmtDate(r.at)}</small></b>
                      {r.text}
                    </div>
                  ))}
                </div>
                {active.status !== 'resolved' && (
                  <div className="st-reply" style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                    <input value={reply} onChange={(e) => setReply(e.target.value)} placeholder={isManager ? 'Reply to the staff member…' : 'Add more details…'} onKeyDown={(e) => e.key === 'Enter' && sendReply()} style={{ flex: 1 }} />
                    <Button onClick={sendReply}><Send size={15} /> Send</Button>
                  </div>
                )}
                {active.status === 'resolved' && <p className="ad-muted" style={{ fontSize: 12.5, marginTop: 12 }}>This concern is resolved. {isManager ? 'Change the status to reopen it.' : 'Raise a new one if the issue comes back.'}</p>}
              </div>
            </div>
          )}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Raise a concern" subtitle="Be specific — it helps HR resolve it faster."
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit}>Submit</Button></>}>
        <form onSubmit={submit} className="ad-form-grid">
          <FormField label="Category">
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CONCERN_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </FormField>
          <FormField label="Priority">
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
            </select>
          </FormField>
          <FormField label="Subject" span2><input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Short summary" /></FormField>
          <FormField label="Details" span2><textarea rows="4" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="What happened, when, and what outcome you expect" /></FormField>
        </form>
      </Modal>
    </>
  )
}
