import {
  LayoutDashboard, Users, ClipboardCheck, CalendarRange, Clock3, Banknote, CalendarCog, Megaphone, MessageSquareWarning,
} from 'lucide-react'

const ALL = ['hr', 'manager']
const HR = ['hr']

/* Sidebar nav — `roles` restricts visibility. */
export const HR_NAV = [
  { to: '/hr', label: 'Dashboard', Icon: LayoutDashboard, end: true, roles: ALL, group: 'People' },
  { to: '/hr/employees', label: 'Employees', Icon: Users, roles: ALL, group: 'People' },
  { to: '/hr/approvals', label: 'Approvals', Icon: ClipboardCheck, roles: ALL, group: 'People' },
  { to: '/hr/roster', label: 'Roster', Icon: CalendarRange, roles: ALL, group: 'People' },
  { to: '/hr/attendance', label: 'Attendance', Icon: Clock3, roles: ALL, group: 'People' },
  { to: '/hr/concerns', label: 'Concerns', Icon: MessageSquareWarning, roles: ALL, group: 'People' },
  { to: '/hr/payroll', label: 'Payroll', Icon: Banknote, roles: HR, group: 'HR' },
  { to: '/hr/leave-policy', label: 'Leave policy', Icon: CalendarCog, roles: HR, group: 'HR' },
  { to: '/hr/announcements', label: 'Announcements', Icon: Megaphone, roles: ALL, group: 'HR' },
]

export const TITLES = {
  '/hr': { t: 'Dashboard', s: 'Your team today' },
  '/hr/employees': { t: 'Employees', s: 'Records, employment status, salary & leave quotas' },
  '/hr/approvals': { t: 'Approvals', s: 'Leave, shift change & overtime requests' },
  '/hr/roster': { t: 'Roster', s: 'Assign shifts and wards for the week' },
  '/hr/attendance': { t: 'Attendance', s: 'Time in clinic, overtime & leave per month' },
  '/hr/concerns': { t: 'Concerns', s: 'Issues raised by staff' },
  '/hr/payroll': { t: 'Payroll', s: 'Monthly pay and payroll runs' },
  '/hr/leave-policy': { t: 'Leave policy', s: 'Default quotas & public holidays' },
  '/hr/announcements': { t: 'Announcements', s: 'Notices shown in the staff portal' },
}

export const EMPLOYMENT_STATUS = {
  probation: { label: 'Probation', kind: 'amber' },
  permanent: { label: 'Permanent', kind: 'green' },
  notice: { label: 'Notice period', kind: 'red' },
  resigned: { label: 'Resigned', kind: 'gray' },
}
export const CONTRACT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Intern']
export const ONBOARDING_STEPS = ['Contract signed', 'ID & documents collected', 'Bank details', 'Portal account created', 'Uniform & badge', 'Orientation done']

export const PRIORITY_BADGE = { low: 'gray', medium: 'blue', high: 'red' }
