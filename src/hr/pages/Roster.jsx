import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, ArrowLeftRight, Copy, CalendarDays } from 'lucide-react'
import PageHeader from '../../admin/components/PageHeader'
import Modal from '../../admin/components/Modal'
import FormField from '../../admin/components/FormField'
import DataTable from '../../admin/components/DataTable'
import { Button } from '../../admin/components/ui'
import { useToast } from '../../admin/hooks/useToast'
import { useStore } from '../../admin/hooks/useStore'
import { useAuth } from '../hooks/useAuth'
import * as store from '../../services/staffStore'
import { SHIFTS, WARDS } from '../../data/staff'
import { fmtDate } from '../../admin/utils/format'
import { StatusBadge, ShiftCell, StaffCell } from '../../components/staff-common'

const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function Roster() {
  const { user, isManager } = useAuth()
  const toast = useToast()
  const [ws, setWs] = useState(() => store.weekStart(store.TODAY))
  const week = useMemo(() => Array.from({ length: 7 }, (_, i) => store.addDays(ws, i)), [ws])
  const [deptFilter, setDeptFilter] = useState('all')

  const [staff] = useStore(() => store.getStaff().filter((s) => s.active !== false), [])
  const [shifts] = useStore(() => store.getShifts({ from: ws, to: week[6] }), [ws])
  const [requests] = useStore(() => store.getShiftRequests(isManager ? undefined : user.id), [user.id, isManager])
  const staffById = useMemo(() => Object.fromEntries(staff.map((s) => [s.id, s])), [staff])
  const depts = useMemo(() => ['all', ...new Set(staff.map((s) => s.dept))], [staff])

  const rows = useMemo(() => {
    const list = deptFilter === 'all' ? staff : staff.filter((s) => s.dept === deptFilter)
    // Logged-in user first, then by department/name.
    return [...list].sort((a, b) => (a.id === user.id ? -1 : b.id === user.id ? 1 : a.dept.localeCompare(b.dept) || a.name.localeCompare(b.name)))
  }, [staff, deptFilter, user.id])

  const cell = (staffId, date) => shifts.find((s) => s.staffId === staffId && s.date === date)

  /* ---- manager: assign ---- */
  const [assign, setAssign] = useState(null) // { staffId, date, shift, ward }
  const saveAssign = () => {
    store.setShift(assign)
    toast('Shift updated', `${staffById[assign.staffId]?.name} · ${fmtDate(assign.date)} · ${SHIFTS[assign.shift].label}`)
    setAssign(null)
  }

  /* ---- staff: swap / handover ---- */
  const [req, setReq] = useState(null) // { kind, shiftId, toStaffId, targetShiftId, reason }
  const openRequest = (myShift) => setReq({ kind: 'swap', shiftId: myShift.id, toStaffId: '', targetShiftId: '', reason: '' })
  const myShiftForReq = req ? shifts.find((s) => s.id === req.shiftId) : null
  const colleagueShifts = req && req.toStaffId ? store.getShifts({ staffId: req.toStaffId, from: ws, to: store.addDays(ws, 13) }).filter((s) => s.shift !== 'off') : []
  const sendRequest = () => {
    if (!req.toStaffId) return toast('Pick a colleague', '', 'warn')
    if (req.kind === 'swap' && !req.targetShiftId) return toast('Pick the shift to swap with', '', 'warn')
    if (!req.reason.trim()) return toast('Reason required', '', 'warn')
    store.requestShiftChange({ kind: req.kind, fromStaffId: user.id, toStaffId: req.toStaffId, shiftId: req.shiftId, targetShiftId: req.kind === 'swap' ? req.targetShiftId : null, reason: req.reason })
    toast('Request sent', 'Your manager will review the change')
    setReq(null)
  }

  const onCellClick = (s, date) => {
    const sh = cell(s.id, date)
    if (isManager) return setAssign({ staffId: s.id, date, shift: sh?.shift || 'morning', ward: sh?.ward || s.dept })
    if (s.id === user.id && sh && sh.shift !== 'off' && date >= store.TODAY) openRequest(sh)
  }

  const reqColumns = [
    { key: 'kind', header: 'Type', render: (r) => <b style={{ textTransform: 'capitalize' }}>{r.kind}</b> },
    ...(isManager ? [{ key: 'from', header: 'From', render: (r) => <StaffCell staff={staffById[r.fromStaffId]} sub="" /> }] : []),
    { key: 'shift', header: 'Shift', render: (r) => { const s = store.getShift(r.shiftId); return s ? `${fmtDate(s.date)} · ${SHIFTS[s.shift]?.label}` : '—' } },
    { key: 'to', header: 'With', render: (r) => <StaffCell staff={staffById[r.toStaffId]} sub={r.targetShiftId ? (() => { const t = store.getShift(r.targetShiftId); return t ? `${fmtDate(t.date)} · ${SHIFTS[t.shift]?.label}` : '' })() : 'takes the shift'} /> },
    { key: 'reason', header: 'Reason' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ]

  return (
    <>
      <PageHeader title="Duty Roster" subtitle={isManager ? 'Click any cell to assign a shift.' : 'Click one of your upcoming shifts to request a swap or handover.'}>
        {isManager && <Button variant="ghost" onClick={() => { store.copyPreviousWeek(ws); toast('Week copied', 'Previous week’s roster applied') }}><Copy size={16} /> Copy previous week</Button>}
        <div className="ad-seg">
          <button onClick={() => setWs(store.addDays(ws, -7))}><ChevronLeft size={15} /></button>
          <button className="active" onClick={() => setWs(store.weekStart(store.TODAY))}><CalendarDays size={14} /> {fmtDate(ws)} – {fmtDate(week[6])}</button>
          <button onClick={() => setWs(store.addDays(ws, 7))}><ChevronRight size={15} /></button>
        </div>
      </PageHeader>

      <div className="ad-toolbar">
        <div className="ad-chips">
          {depts.map((d) => <button key={d} className={`ad-chip ${deptFilter === d ? 'active' : ''}`} onClick={() => setDeptFilter(d)}>{d}</button>)}
        </div>
        <div className="st-legend" style={{ marginLeft: 'auto' }}>
          {Object.entries(SHIFTS).map(([k, v]) => <span key={k}><i style={{ background: v.color }} />{v.label}{v.start && ` ${v.start}–${v.end}`}</span>)}
        </div>
      </div>

      <div className="ad-card">
        <div className="st-roster">
          <table>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Staff</th>
                {week.map((d, i) => <th key={d} className={d === store.TODAY ? 'today' : ''}>{DOW[i]}<small>{Number(d.slice(-2))}</small></th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id} className={s.id === user.id ? 'me' : ''}>
                  <td><StaffCell staff={s} sub={s.id === user.id ? 'You' : `${s.designation}`} /></td>
                  {week.map((d) => {
                    const sh = cell(s.id, d)
                    const clickable = isManager || (s.id === user.id && sh && sh.shift !== 'off' && d >= store.TODAY)
                    return <td key={d}><ShiftCell shift={sh?.shift} ward={sh?.ward} onClick={clickable ? () => onCellClick(s, d) : undefined} /></td>
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <h3 style={{ margin: '26px 0 12px', fontSize: 16, fontWeight: 800 }}>{isManager ? 'Shift change requests' : 'My shift requests'}</h3>
      <DataTable columns={reqColumns} rows={[...requests].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))} empty="No shift requests." />

      {/* manager assign */}
      <Modal open={!!assign} onClose={() => setAssign(null)} title="Assign shift" subtitle={assign && `${staffById[assign.staffId]?.name} · ${fmtDate(assign.date)}`} width={420}
        footer={<><Button variant="ghost" onClick={() => setAssign(null)}>Cancel</Button><Button onClick={saveAssign}>Save</Button></>}>
        {assign && (
          <div style={{ display: 'grid', gap: 14 }}>
            <FormField label="Shift">
              <div className="ad-daypills">
                {Object.entries(SHIFTS).map(([k, v]) => (
                  <button key={k} type="button" className={`ad-daypill ${assign.shift === k ? 'on' : ''}`} style={assign.shift === k ? { background: v.color, borderColor: v.color } : undefined} onClick={() => setAssign({ ...assign, shift: k })}>{v.label}</button>
                ))}
              </div>
            </FormField>
            {assign.shift !== 'off' && (
              <FormField label="Ward / area">
                <select value={assign.ward} onChange={(e) => setAssign({ ...assign, ward: e.target.value })}>
                  {[...new Set([assign.ward, ...WARDS])].map((w) => <option key={w}>{w}</option>)}
                </select>
              </FormField>
            )}
          </div>
        )}
      </Modal>

      {/* staff request */}
      <Modal open={!!req} onClose={() => setReq(null)} title="Request a shift change" subtitle={myShiftForReq && `Your ${SHIFTS[myShiftForReq.shift]?.label.toLowerCase()} shift on ${fmtDate(myShiftForReq.date)}`}
        footer={<><Button variant="ghost" onClick={() => setReq(null)}>Cancel</Button><Button onClick={sendRequest}><ArrowLeftRight size={15} /> Send request</Button></>}>
        {req && (
          <div className="ad-form-grid">
            <FormField label="What do you need?" span2>
              <div className="ad-seg">
                <button className={req.kind === 'swap' ? 'active' : ''} onClick={() => setReq({ ...req, kind: 'swap' })}>Swap shifts</button>
                <button className={req.kind === 'handover' ? 'active' : ''} onClick={() => setReq({ ...req, kind: 'handover', targetShiftId: '' })}>Hand over (I get the day off)</button>
              </div>
            </FormField>
            <FormField label="Colleague" span2>
              <select value={req.toStaffId} onChange={(e) => setReq({ ...req, toStaffId: e.target.value, targetShiftId: '' })}>
                <option value="">Select a colleague…</option>
                {staff.filter((s) => s.id !== user.id && s.role === 'staff').map((s) => <option key={s.id} value={s.id}>{s.name} — {s.designation}</option>)}
              </select>
            </FormField>
            {req.kind === 'swap' && (
              <FormField label="Their shift you want" span2>
                <select value={req.targetShiftId} onChange={(e) => setReq({ ...req, targetShiftId: e.target.value })} disabled={!req.toStaffId}>
                  <option value="">Select a shift…</option>
                  {colleagueShifts.map((s) => <option key={s.id} value={s.id}>{fmtDate(s.date)} · {SHIFTS[s.shift]?.label} · {s.ward}</option>)}
                </select>
              </FormField>
            )}
            <FormField label="Reason" span2>
              <textarea rows="2" value={req.reason} onChange={(e) => setReq({ ...req, reason: e.target.value })} placeholder="Why do you need this change?" />
            </FormField>
          </div>
        )}
      </Modal>
    </>
  )
}
