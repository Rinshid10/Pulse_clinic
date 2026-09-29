import { LayoutDashboard, ShoppingCart, FileText } from 'lucide-react'

const ALL = ['admin', 'pharmacist']

/* Sidebar nav — add new pharmacy features here. */
export const PHARMACY_NAV = [
  { to: '/pharmacy', label: 'Overview', Icon: LayoutDashboard, end: true, roles: ALL },
  { to: '/pharmacy/sell', label: 'Sell medicines', short: 'Sell', Icon: ShoppingCart, roles: ALL },
  { to: '/pharmacy/medicine-bills', label: 'Medicine bills', short: 'Bills', Icon: FileText, roles: ALL },
]

export const TITLES = {
  '/pharmacy': { t: 'Overview', s: 'Today’s pharmacy sales at a glance' },
  '/pharmacy/sell': { t: 'Sell medicines', s: 'Customer lookup, cart, stock & requests' },
  '/pharmacy/medicine-bills': { t: 'Medicine bills', s: 'All pharmacy sales, totals & history' },
}
