import { LayoutDashboard, Receipt, Pill, FileText } from 'lucide-react'

const ALL = ['admin', 'cashier', 'pharmacist']

/* Sidebar nav — `roles` restricts visibility. Add new billing features here. */
export const BILLING_NAV = [
  { to: '/billing', label: 'Overview', Icon: LayoutDashboard, end: true, roles: ALL },
  { to: '/billing/bills', label: 'Consultation bills', Icon: Receipt, roles: ['admin', 'cashier'] },
  { to: '/billing/medicine-bills', label: 'Medicine bills', Icon: FileText, roles: ALL },
  { to: '/billing/pharmacy', label: 'Pharmacy', Icon: Pill, roles: ['admin', 'pharmacist'] },
]

export const TITLES = {
  '/billing': { t: 'Overview', s: 'Today’s collections at a glance' },
  '/billing/bills': { t: 'Consultation bills', s: 'Patient bills, 7-day free follow-up validity & daily totals' },
  '/billing/medicine-bills': { t: 'Medicine bills', s: 'All pharmacy sales, totals & history' },
  '/billing/pharmacy': { t: 'Pharmacy', s: 'Medicine sales, stock & customer history' },
}
