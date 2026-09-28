import {
  LayoutDashboard, CalendarOff, CalendarRange, Clock3, Wallet, MessageSquareWarning, UserRound,
} from 'lucide-react'

const ALL = ['staff', 'manager', 'hr']

/* Sidebar nav — `roles` restricts visibility. */
export const STAFF_NAV = [
  { to: '/staff', label: 'Dashboard', Icon: LayoutDashboard, end: true, roles: ALL, group: 'My work' },
  { to: '/staff/leave', label: 'My Leave', Icon: CalendarOff, roles: ALL, group: 'My work' },
  { to: '/staff/roster', label: 'Duty Roster', Icon: CalendarRange, roles: ALL, group: 'My work' },
  { to: '/staff/overtime', label: 'Overtime', Icon: Clock3, roles: ALL, group: 'My work' },
  { to: '/staff/salary', label: 'Salary', Icon: Wallet, roles: ALL, group: 'My work' },
  { to: '/staff/concerns', label: 'Concerns', Icon: MessageSquareWarning, roles: ALL, group: 'My work' },
  { to: '/staff/profile', label: 'My Profile', Icon: UserRound, roles: ALL, group: 'My work' },
]

export const TITLES = {
  '/staff': { t: 'Dashboard', s: 'Your week at a glance' },
  '/staff/leave': { t: 'My Leave', s: 'Apply for leave and track balances' },
  '/staff/roster': { t: 'Duty Roster', s: 'Shifts, swaps and handovers' },
  '/staff/overtime': { t: 'Overtime', s: 'Log extra hours for approval' },
  '/staff/salary': { t: 'Salary', s: 'Pay structure and monthly payslips' },
  '/staff/concerns': { t: 'Concerns', s: 'Raise issues and follow up' },
  '/staff/profile': { t: 'My Profile', s: 'Personal, emergency and health details' },
}

export const PRIORITY_BADGE = { low: 'gray', medium: 'blue', high: 'red' }
