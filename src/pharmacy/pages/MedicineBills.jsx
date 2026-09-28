import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pill, DollarSign, Receipt, Users, Send } from 'lucide-react'
import PageHeader from '../../admin/components/PageHeader'
import StatCard from '../../admin/components/StatCard'
import { Button } from '../../admin/components/ui'
import { useStore } from '../../admin/hooks/useStore'
import { useAuth } from '../hooks/useAuth'
import * as store from '../../services/billingStore'
import { money } from '../../admin/utils/format'
import PharmacyBills from '../components/PharmacyBills'
import { RequestMedicineModal, MedicineRequestList } from '../components/MedicineRequests'

export default function MedicineBills() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [summary] = useStore(() => store.billingSummary(), [])
  const [bills] = useStore(() => store.getPharmacyBills(), [])
  const [customers] = useStore(() => store.knownCustomers(), [])
  const todayCount = bills.filter((b) => b.date === store.TODAY).length
  const canSell = user.role !== 'cashier'
  const [request, setRequest] = useState(false)
  const [pendingReq] = useStore(() => store.pendingMedicineRequests(), [])

  return (
    <>
      <PageHeader title="Medicine bills" subtitle="Every pharmacy sale, with what was bought and who prescribed it.">
        <Button variant="ghost" onClick={() => setRequest(true)}><Send size={16} /> Request medicine{pendingReq > 0 ? ` (${pendingReq} pending)` : ''}</Button>
        {canSell && <Button onClick={() => navigate('/pharmacy/sell')}><Pill size={16} /> New medicine bill</Button>}
      </PageHeader>

      <div className="ad-grid ad-stats" style={{ marginBottom: 18 }}>
        <StatCard index={0} icon={DollarSign} tone="brand" value={money(summary.pharmacyToday)} label={`Medicine sales today · ${todayCount} bill${todayCount === 1 ? '' : 's'}`} />
        <StatCard index={1} icon={Receipt} tone="green" value={money(summary.pharmacyMonth)} label="This month" />
        <StatCard index={2} icon={DollarSign} tone="violet" value={money(summary.pharmacyAll)} label="All time" trend={`${bills.length} bills`} up />
        <StatCard index={3} icon={Users} tone="amber" value={customers.length} label="Pharmacy customers" />
      </div>

      <PharmacyBills onLoadCustomer={canSell ? (c) => navigate('/pharmacy/sell', { state: { customer: c } }) : undefined} />

      <div className="ad-card" style={{ marginTop: 22 }}>
        <div className="ad-card__head"><h3><Send size={15} style={{ verticalAlign: -2 }} /> Medicine requests to admin</h3><span className="ad-muted" style={{ fontSize: 12.5 }}>Restocks and new medicines asked for by the desk</span></div>
        <div className="ad-card__body"><MedicineRequestList /></div>
      </div>

      <RequestMedicineModal open={request} preset="" onClose={() => setRequest(false)} />
    </>
  )
}
