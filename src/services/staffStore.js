/* ============================================================
   Staff portal store — leave, roster, overtime, salary, concerns.

   Same localStorage + `pulse:store` event mechanism as clinicStore,
   so admin/customer views that subscribe() stay live too.
   ============================================================ */

import { read, write, uid, subscribe, TODAY, setLeave, addNotification } from './clinicStore'
import {
  STAFF as SEED_STAFF, SHIFTS_SEED, LEAVE_REQUESTS as SEED_LEAVES, SHIFT_REQUESTS as SEED_SHIFT_REQS,
  OVERTIME as SEED_OT, CONCERNS as SEED_CONCERNS, LEAVE_TYPES, SHIFTS,
} from '../data/staff'

export { subscribe, TODAY }

export const KEYS = {
  staff: 'pulse-staff',
  session: 'pulse-staff-session',
  leaves: 'pulse-leave-requests',
  shifts: 'pulse-shifts',
  shiftRequests: 'pulse-shift-requests',
  overtime: 'pulse-overtime',
  concerns: 'pulse-concerns',
}

/* ---------- date helpers ---------- */
export const addDays = (iso, n) => {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, m - 1, d + n)
  return toISO(dt)
}
export const toISO = (dt) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
export const daysBetween = (from, to) => {
  const [y1, m1, d1] = from.split('-').map(Number)
  const [y2, m2, d2] = to.split('-').map(Number)
  return Math.round((new Date(y2, m2 - 1, d2) - new Date(y1, m1 - 1, d1)) / 86400000) + 1
}
/** Monday of the week containing `iso`. */
export const weekStart = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  const dow = (dt.getDay() + 6) % 7 // Mon=0
  return addDays(iso, -dow)
}
export const monthOf = (iso) => iso.slice(0, 7)
export const isWeekend = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  const dow = new Date(y, m - 1, d).getDay()
  return dow === 0 || dow === 6
}
/** Next working day after `iso` (skips Sat/Sun). */
export const returnDate = (iso) => {
  let next = addDays(iso, 1)
  while (isWeekend(next)) next = addDays(next, 1)
  return next
}

/* ============================================================
   STAFF
   ============================================================ */
const seedStaff = () => write(KEYS.staff, SEED_STAFF)
export const getStaff = () => read(KEYS.staff, null) || seedStaff()
export const getStaffMember = (id) => getStaff().find((s) => s.id === id) || null
export const addStaff = (data) => {
  const rec = { id: uid('s'), active: true, role: 'staff', leaveQuota: defaultQuota(), health: {}, emergency: {}, salary: {}, ...data }
  write(KEYS.staff, [...getStaff(), rec])
  return rec
}
export const updateStaff = (id, patch) =>
  write(KEYS.staff, getStaff().map((s) => (s.id === id ? { ...s, ...patch } : s)))
export const setStaffActive = (id, active) => updateStaff(id, { active })
export const defaultQuota = () =>
  Object.fromEntries(Object.entries(LEAVE_TYPES).filter(([, v]) => v.quota).map(([k, v]) => [k, v.quota]))

/* ============================================================
   LEAVE
   ============================================================ */
const seedLeaves = () => write(KEYS.leaves, SEED_LEAVES)
export const getLeaveRequests = (staffId) => {
  const all = read(KEYS.leaves, null) || seedLeaves()
  return staffId ? all.filter((l) => l.staffId === staffId) : all
}

/** Remaining/used days per leave type for the year of TODAY. */
export const leaveBalance = (staffId, year = TODAY.slice(0, 4)) => {
  const s = getStaffMember(staffId)
  const quota = { ...defaultQuota(), ...(s?.leaveQuota || {}) }
  const used = {}
  getLeaveRequests(staffId)
    .filter((l) => l.status === 'approved' && l.from.startsWith(year))
    .forEach((l) => { used[l.type] = (used[l.type] || 0) + l.days })
  return Object.keys(LEAVE_TYPES).map((type) => ({
    type, ...LEAVE_TYPES[type], quota: quota[type] ?? 0, used: used[type] || 0,
    left: Math.max(0, (quota[type] ?? 0) - (used[type] || 0)),
  }))
}

export const applyLeave = (data) => {
  const days = data.halfDay ? 0.5 : daysBetween(data.from, data.to)
  const rec = { id: uid('lr'), status: 'pending', appliedAt: TODAY, days, ...data }
  write(KEYS.leaves, [rec, ...getLeaveRequests()])
  return rec
}

export const cancelLeave = (id) =>
  write(KEYS.leaves, getLeaveRequests().map((l) => (l.id === id ? { ...l, status: 'cancelled' } : l)))

export const decideLeave = (id, status, by, note = '') => {
  const all = getLeaveRequests()
  const rec = all.find((l) => l.id === id)
  if (!rec) return
  write(KEYS.leaves, all.map((l) => (l.id === id ? { ...l, status, reviewedBy: by, reviewedAt: TODAY, note } : l)))
  const staff = getStaffMember(rec.staffId)
  if (status === 'approved') {
    // Doctor on leave today → hide their booking slots on the customer site.
    if (staff?.doctorId && rec.from <= TODAY && rec.to >= TODAY) {
      setLeave(staff.doctorId, { type: rec.halfDay ? 'half' : 'full', half: rec.half || 'am', reason: LEAVE_TYPES[rec.type]?.label || 'Leave' })
    }
    addNotification({ type: 'leave', title: 'Leave approved', body: `${staff?.name || 'Staff'} — ${LEAVE_TYPES[rec.type]?.label} ${rec.from} → ${rec.to}` })
  }
}

/* ============================================================
   ROSTER / SHIFTS
   ============================================================ */
const seedShifts = () => write(KEYS.shifts, SHIFTS_SEED)
export const getShifts = ({ from, to, staffId } = {}) => {
  let all = read(KEYS.shifts, null) || seedShifts()
  if (from) all = all.filter((s) => s.date >= from)
  if (to) all = all.filter((s) => s.date <= to)
  if (staffId) all = all.filter((s) => s.staffId === staffId)
  return all
}
export const getShift = (id) => getShifts().find((s) => s.id === id) || null

/** Create or replace a staff member's shift for a date. */
export const setShift = ({ staffId, date, shift, ward }) => {
  const all = getShifts()
  const existing = all.find((s) => s.staffId === staffId && s.date === date)
  if (existing) return write(KEYS.shifts, all.map((s) => (s.id === existing.id ? { ...s, shift, ward: ward ?? s.ward } : s)))
  return write(KEYS.shifts, [...all, { id: uid('sh'), staffId, date, shift, ward: ward || 'General' }])
}

/** Copy every shift from the previous week into the week starting `weekISO`. */
export const copyPreviousWeek = (weekISO) => {
  const prevStart = addDays(weekISO, -7)
  const prev = getShifts({ from: prevStart, to: addDays(prevStart, 6) })
  let all = getShifts().filter((s) => !(s.date >= weekISO && s.date <= addDays(weekISO, 6)))
  prev.forEach((p) => all.push({ ...p, id: uid('sh'), date: addDays(p.date, 7) }))
  return write(KEYS.shifts, all)
}

export const nextShift = (staffId) =>
  getShifts({ staffId, from: TODAY }).filter((s) => s.shift !== 'off').sort((a, b) => a.date.localeCompare(b.date))[0] || null

const seedShiftReqs = () => write(KEYS.shiftRequests, SEED_SHIFT_REQS)
export const getShiftRequests = (staffId) => {
  const all = read(KEYS.shiftRequests, null) || seedShiftReqs()
  return staffId ? all.filter((r) => r.fromStaffId === staffId || r.toStaffId === staffId) : all
}
export const requestShiftChange = (data) => {
  const rec = { id: uid('sr'), status: 'pending', createdAt: TODAY, ...data }
  write(KEYS.shiftRequests, [rec, ...getShiftRequests()])
  return rec
}
export const decideShiftRequest = (id, status, by, note = '') => {
  const all = getShiftRequests()
  const rec = all.find((r) => r.id === id)
  if (!rec) return
  write(KEYS.shiftRequests, all.map((r) => (r.id === id ? { ...r, status, decidedBy: by, decidedAt: TODAY, note } : r)))
  if (status !== 'approved') return
  const shifts = getShifts()
  const a = shifts.find((s) => s.id === rec.shiftId)
  const b = rec.targetShiftId ? shifts.find((s) => s.id === rec.targetShiftId) : null
  if (!a) return
  if (rec.kind === 'swap' && b) {
    // Exchange the two people's shifts on those days.
    write(KEYS.shifts, shifts.map((s) => {
      if (s.id === a.id) return { ...s, shift: b.shift, ward: b.ward }
      if (s.id === b.id) return { ...s, shift: a.shift, ward: a.ward }
      return s
    }))
  } else {
    // Handover: colleague takes the shift, requester gets the day off.
    let next = shifts.map((s) => (s.id === a.id ? { ...s, shift: 'off' } : s))
    const target = next.find((s) => s.staffId === rec.toStaffId && s.date === a.date)
    if (target) next = next.map((s) => (s.id === target.id ? { ...s, shift: a.shift, ward: a.ward } : s))
    else next.push({ id: uid('sh'), staffId: rec.toStaffId, date: a.date, shift: a.shift, ward: a.ward })
    write(KEYS.shifts, next)
  }
}

/* ============================================================
   OVERTIME
   ============================================================ */
const seedOT = () => write(KEYS.overtime, SEED_OT)
export const getOvertime = (staffId) => {
  const all = read(KEYS.overtime, null) || seedOT()
  return staffId ? all.filter((o) => o.staffId === staffId) : all
}
export const logOvertime = ({ staffId, date, hours, reason }) => {
  const rate = getStaffMember(staffId)?.salary?.otRate || 0
  const h = Number(hours)
  const rec = { id: uid('ot'), staffId, date, hours: h, reason, rate, amount: Math.round(h * rate * 100) / 100, status: 'pending' }
  write(KEYS.overtime, [rec, ...getOvertime()])
  return rec
}
export const decideOvertime = (id, status, by, note = '') =>
  write(KEYS.overtime, getOvertime().map((o) => (o.id === id ? { ...o, status, decidedBy: by, decidedAt: TODAY, note } : o)))

/* ============================================================
   SALARY / PAYSLIP
   ============================================================ */
const WORKING_DAYS = 22

/** Month is 'YYYY-MM'. Pure calculation from the current store state. */
export const payslip = (staffId, month = monthOf(TODAY)) => {
  const s = getStaffMember(staffId)
  if (!s) return null
  const sal = { basic: 0, hra: 0, allowances: 0, deductions: 0, otRate: 0, ...(s.salary || {}) }
  const ot = getOvertime(staffId).filter((o) => o.status === 'approved' && o.date.startsWith(month))
  const otHours = ot.reduce((a, o) => a + o.hours, 0)
  const otAmount = Math.round(ot.reduce((a, o) => a + o.amount, 0) * 100) / 100
  const unpaidDays = getLeaveRequests(staffId)
    .filter((l) => l.status === 'approved' && !LEAVE_TYPES[l.type]?.paid && l.from.startsWith(month))
    .reduce((a, l) => a + l.days, 0)
  const dailyRate = Math.round((sal.basic / WORKING_DAYS) * 100) / 100
  const unpaidDeduction = Math.round(unpaidDays * dailyRate * 100) / 100
  const gross = sal.basic + sal.hra + sal.allowances + otAmount
  const totalDeductions = sal.deductions + unpaidDeduction
  return {
    staffId, month, ...sal, otHours, otAmount, unpaidDays, dailyRate, unpaidDeduction, gross, totalDeductions,
    net: Math.round((gross - totalDeductions) * 100) / 100,
  }
}

/* ============================================================
   CONCERNS
   ============================================================ */
const seedConcerns = () => write(KEYS.concerns, SEED_CONCERNS)
export const getConcerns = (staffId) => {
  const all = read(KEYS.concerns, null) || seedConcerns()
  return staffId ? all.filter((c) => c.staffId === staffId) : all
}
export const raiseConcern = (data) => {
  const rec = { id: uid('c'), status: 'open', createdAt: TODAY, replies: [], priority: 'medium', ...data }
  write(KEYS.concerns, [rec, ...getConcerns()])
  return rec
}
export const replyConcern = (id, by, text) =>
  write(KEYS.concerns, getConcerns().map((c) => (c.id === id ? { ...c, replies: [...(c.replies || []), { by, at: TODAY, text }] } : c)))
export const setConcernStatus = (id, status) =>
  write(KEYS.concerns, getConcerns().map((c) => (c.id === id ? { ...c, status } : c)))

/* ============================================================
   SUMMARY helpers for dashboards
   ============================================================ */
export const pendingCounts = () => ({
  leave: getLeaveRequests().filter((l) => l.status === 'pending').length,
  shifts: getShiftRequests().filter((r) => r.status === 'pending').length,
  overtime: getOvertime().filter((o) => o.status === 'pending').length,
  concerns: getConcerns().filter((c) => c.status !== 'resolved').length,
})

export const onLeaveOn = (iso) => {
  const ids = getLeaveRequests().filter((l) => l.status === 'approved' && l.from <= iso && l.to >= iso).map((l) => l.staffId)
  return getStaff().filter((s) => ids.includes(s.id))
}

export const resetStaffData = () => Object.values(KEYS).forEach((k) => localStorage.removeItem(k))

export { LEAVE_TYPES, SHIFTS }
