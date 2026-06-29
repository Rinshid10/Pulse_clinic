import { useMemo, useState } from 'react'
import { Search, Eye, Phone, Mail, Droplet } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import { Avatar, Badge, Button } from '../components/ui'
import { useStore } from '../hooks/useStore'
import * as svc from '../services/patientService'
import { getDoctor } from '../../services/clinicStore'
import { STATUS_BADGE } from '../utils/constants'
import { fmtDate, relDay, to12h } from '../utils/format'

export default function Patients() {
  const [patients] = useStore(() => svc.listPatients(), [])
  const [q, setQ] = useState('')
  const [view, setView] = useState(null)

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase()
    return patients.filter((p) => (p.name + p.email + p.phone).toLowerCase().includes(query))
  }, [patients, q])

  const history = view ? svc.visitHistory(view.name) : []

  const columns = [
    { key: 'name', header: 'Patient', render: (p) => (
      <div className="ad-cell-user"><Avatar name={p.name} size="sm" /><div><b>{p.name}</b><br /><small>{p.gender} · {p.age} yrs</small></div></div>
    ) },
    { key: 'phone', header: 'Contact', render: (p) => <div><b style={{ fontWeight: 600 }}>{p.phone}</b><br /><small className="ad-muted">{p.email}</small></div> },
    { key: 'bloodGroup', header: 'Blood', render: (p) => <span className="ad-tag"><Droplet size={12} /> {p.bloodGroup}</span> },
    { key: 'lastVisit', header: 'Last visit', render: (p) => fmtDate(p.lastVisit) },
    { key: 'visits', header: 'Visits', render: (p) => <Badge kind="blue">{p.visits}</Badge> },
    { key: 'actions', header: '', width: 60, render: (p) => (
      <div className="ad-rowact"><button className="go" title="View" onClick={() => setView(p)}><Eye size={15} /></button></div>
    ) },
  ]

  return (
    <>
      <PageHeader title="Patients" subtitle={`${patients.length} registered patients`} />

      <div className="ad-toolbar">
        <div className="ad-search" style={{ marginLeft: 0 }}>
          <Search size={16} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patients…" />
        </div>
      </div>

      <DataTable columns={columns} rows={rows} empty="No patients found." />

      <Modal open={!!view} onClose={() => setView(null)} title="Patient profile" subtitle={view?.name}
        footer={<Button variant="ghost" onClick={() => setView(null)}>Close</Button>}>
        {view && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 14 }}>
              <Avatar name={view.name} size="lg" />
              <div>
                <b style={{ fontSize: 18 }}>{view.name}</b><br />
                <span className="ad-muted">{view.gender} · {view.age} yrs · {view.bloodGroup}</span>
              </div>
            </div>
            <div className="ad-kv"><span><Phone size={14} style={{ verticalAlign: -2, marginRight: 6 }} />Phone</span><b>{view.phone}</b></div>
            <div className="ad-kv"><span><Mail size={14} style={{ verticalAlign: -2, marginRight: 6 }} />Email</span><b>{view.email}</b></div>
            <div className="ad-kv"><span>Total visits</span><b>{view.visits}</b></div>

            <h4 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--ad-text-3)', margin: '20px 0 10px' }}>
              Visit history
            </h4>
            <div style={{ display: 'grid', gap: 8 }}>
              {history.length === 0 && <span className="ad-muted" style={{ fontSize: 13 }}>No visit records.</span>}
              {history.map((h, i) => {
                const d = getDoctor(h.doctorId)
                const s = STATUS_BADGE[h.status] || STATUS_BADGE.pending
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--ad-surface-2)', borderRadius: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <b style={{ fontSize: 13.5 }}>{h.type}</b> <span className="ad-muted" style={{ fontSize: 12.5 }}>· {d?.name?.replace('Dr. ', '') || '—'}</span>
                      <div className="ad-muted" style={{ fontSize: 12 }}>{relDay(h.date)} · {to12h(h.time)}</div>
                    </div>
                    <Badge kind={s.kind}>{s.label}</Badge>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
