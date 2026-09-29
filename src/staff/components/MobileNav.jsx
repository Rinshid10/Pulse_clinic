import { LayoutDashboard, CalendarOff, CalendarRange, Wallet } from 'lucide-react'
import BottomNav from '../../components/BottomNav'

/* Staff portal phone tabs: the four things employees use most; "More" opens the drawer. */
const TABS = [
  { to: '/staff', label: 'Home', Icon: LayoutDashboard, end: true },
  { to: '/staff/leave', label: 'Leave', Icon: CalendarOff },
  { to: '/staff/roster', label: 'Roster', Icon: CalendarRange },
  { to: '/staff/salary', label: 'Salary', Icon: Wallet },
]

export default function MobileNav({ onMore, menuOpen }) {
  return <BottomNav tabs={TABS} onMore={onMore} menuOpen={menuOpen} />
}
