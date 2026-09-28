import { Avatar, Badge } from '../admin/components/ui'
import { REQUEST_STATUS, CONCERN_STATUS, SHIFTS, LEAVE_TYPES } from '../data/staff'

export function StatusBadge({ status }) {
  const m = REQUEST_STATUS[status] || CONCERN_STATUS[status] || { label: status, kind: 'gray' }
  return <Badge kind={m.kind}>{m.label}</Badge>
}

export function StaffCell({ staff, sub }) {
  if (!staff) return <span className="ad-muted">Unknown</span>
  return (
    <div className="ad-cell-user">
      <Avatar name={staff.name} color={staff.color} size="sm" />
      <div>
        <b>{staff.name}</b>
        <small>{sub ?? `${staff.designation} · ${staff.dept}`}</small>
      </div>
    </div>
  )
}

export function ShiftCell({ shift, ward, onClick, highlight }) {
  const m = SHIFTS[shift] || SHIFTS.off
  if (!shift) {
    return <div className={`st-cell empty ${onClick ? 'click' : ''}`} onClick={onClick}>—</div>
  }
  return (
    <div
      className={`st-cell ${onClick ? 'click' : ''}`}
      style={{ '--sc': m.color, '--sb': m.bg, outline: highlight ? `2px solid ${m.color}` : undefined }}
      onClick={onClick}
      title={m.start ? `${m.label} ${m.start}–${m.end}` : 'Day off'}
    >
      {m.label}
      {shift !== 'off' && <small>{ward || m.start + '–' + m.end}</small>}
    </div>
  )
}

export function LeaveTypeTag({ type }) {
  const m = LEAVE_TYPES[type] || { label: type, color: '#64748b' }
  return <span className="ad-tag" style={{ color: m.color, background: `${m.color}18` }}>{m.label}</span>
}

export const MONTHS = ['2026-04', '2026-05', '2026-06', '2026-07']
export const monthLabel = (m) => {
  const [y, mm] = m.split('-').map(Number)
  return new Date(y, mm - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}
