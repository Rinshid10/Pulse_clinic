import {
  LayoutDashboard, Stethoscope, CalendarClock, CalendarDays,
  Users, BarChart3, Palette, FileText, Bell, ShieldCheck, BriefcaseBusiness, Pill,
} from 'lucide-react'

/* Sidebar nav — `roles` restricts visibility (role-based access). */
export const NAV = [
  { to: '/admin', label: 'Dashboard', Icon: LayoutDashboard, end: true, roles: ['admin', 'manager', 'receptionist'] },
  { to: '/admin/doctors', label: 'Doctors', Icon: Stethoscope, roles: ['admin', 'manager'] },
  { to: '/admin/availability', label: 'Availability & Leave', short: 'Leave', Icon: CalendarClock, roles: ['admin', 'manager', 'receptionist'] },
  { to: '/admin/appointments', label: 'Appointments', short: 'Appts', Icon: CalendarDays, roles: ['admin', 'manager', 'receptionist'] },
  { to: '/admin/patients', label: 'Patients', Icon: Users, roles: ['admin', 'manager', 'receptionist'] },
  { to: '/admin/staff', label: 'Staff', Icon: BriefcaseBusiness, roles: ['admin', 'manager'] },
  { to: '/admin/medicines', label: 'Medicine stock', short: 'Stock', Icon: Pill, roles: ['admin', 'manager'] },
  { to: '/admin/analytics', label: 'Analytics', Icon: BarChart3, roles: ['admin', 'manager'] },
  { to: '/admin/theme', label: 'Theme', Icon: Palette, roles: ['admin'] },
  { to: '/admin/content', label: 'Website Content', short: 'Content', Icon: FileText, roles: ['admin'] },
  { to: '/admin/notifications', label: 'Notifications', Icon: Bell, roles: ['admin', 'manager', 'receptionist'] },
]

export const STATUS_BADGE = {
  confirmed: { label: 'Confirmed', kind: 'blue' },
  completed: { label: 'Completed', kind: 'green' },
  pending: { label: 'Pending', kind: 'amber' },
  cancelled: { label: 'Cancelled', kind: 'red' },
  booked: { label: 'Booked', kind: 'amber' },
}

export const DOCTOR_STATUS = {
  available: { label: 'Available', kind: 'green' },
  busy: { label: 'With patient', kind: 'amber' },
  'in-surgery': { label: 'In surgery', kind: 'red' },
  'on-leave': { label: 'On leave', kind: 'gray' },
}

export const DEPARTMENTS = ['Cardiology', 'Pediatrics', 'Dermatology', 'Orthopedics', 'Neurology', 'Dentistry']
export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
export const APPT_TYPES = ['Consultation', 'Follow-up', 'Check-up', 'Procedure', 'Emergency']
export { ShieldCheck }
