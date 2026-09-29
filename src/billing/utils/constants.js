import { LayoutDashboard, Receipt, FilePlus2 } from 'lucide-react'

const ALL = ['admin', 'cashier']

/* Sidebar nav — `roles` restricts visibility. Add new billing features here. */
export const BILLING_NAV = [
  { to: '/billing', label: 'Overview', Icon: LayoutDashboard, end: true, roles: ALL },
  { to: '/billing/new', label: 'New bill', Icon: FilePlus2, roles: ALL },
  { to: '/billing/bills', label: 'Consultation bills', short: 'Bills', Icon: Receipt, roles: ALL },
]

export const TITLES = {
  '/billing': { t: 'Overview', s: 'Today’s consultation collections at a glance' },
  '/billing/new': { t: 'New bill', s: 'Patient, doctor, charges & validity' },
  '/billing/bills': { t: 'Consultation bills', s: 'Patient bills, 7-day free follow-up validity & daily totals' },
}
