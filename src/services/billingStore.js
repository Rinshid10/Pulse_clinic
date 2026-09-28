/* ============================================================
   Billing + Pharmacy store (admin console).

   - Consultation bills: patient name/age, doctor, amount, 7-day
     validity → a return visit to the same doctor within 7 days
     is a free follow-up.
   - Pharmacy: medicine catalog with stock, per-customer bills,
     purchase history looked up by customer name.

   Same localStorage + `pulse:store` event mechanism as clinicStore.
   ============================================================ */

import { read, write, uid, subscribe, TODAY, getDoctors, getDoctor } from './clinicStore'

export { subscribe, TODAY }

export const KEYS = {
  bills: 'pulse-bills',
  medicines: 'pulse-medicines',
  pharmacyBills: 'pulse-pharmacy-bills',
}

export const VALIDITY_DAYS = 7
export const PAYMENT_METHODS = ['Cash', 'Card', 'UPI', 'Insurance']
export const MEDICINE_CATEGORIES = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment', 'Drops', 'Inhaler', 'Other']
export const LOW_STOCK = 20

/* ---------- date helpers ---------- */
export const addDays = (iso, n) => {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, m - 1, d + n)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
}
export const daysBetween = (a, b) => {
  const [y1, m1, d1] = a.split('-').map(Number)
  const [y2, m2, d2] = b.split('-').map(Number)
  return Math.round((new Date(y2, m2 - 1, d2) - new Date(y1, m1 - 1, d1)) / 86400000)
}
const nowTime = () => {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
const norm = (s = '') => s.trim().toLowerCase().replace(/\s+/g, ' ')
const r2 = (n) => Math.round(n * 100) / 100

/* ============================================================
   SEED DATA
   ============================================================ */
const SEED_BILLS = [
  { id: 'b1', no: 'PC-0001', patient: { name: 'Olivia Bennett', age: 34, gender: 'Female', phone: '+1 (415) 555-0301' }, doctorId: 'd1', type: 'consultation', items: [{ label: 'Consultation fee', amount: 180 }], discount: 0, total: 180, method: 'Card', date: '2026-06-22', time: '09:20', createdBy: 'Sofia Reyes' },
  { id: 'b2', no: 'PC-0002', patient: { name: 'Lucas Brown', age: 58, gender: 'Male', phone: '+1 (415) 555-0302' }, doctorId: 'd2', type: 'consultation', items: [{ label: 'Consultation fee', amount: 200 }, { label: 'X-ray (shoulder)', amount: 90 }], discount: 0, total: 290, method: 'Insurance', date: '2026-06-24', time: '10:05', createdBy: 'Sofia Reyes' },
  { id: 'b3', no: 'PC-0003', patient: { name: 'Mia Wilson', age: 31, gender: 'Female', phone: '+1 (415) 555-0303' }, doctorId: 'd3', type: 'consultation', items: [{ label: 'Consultation fee', amount: 140 }], discount: 10, total: 130, method: 'Cash', date: '2026-06-25', time: '11:40', createdBy: 'Amelia Hart' },
  { id: 'b4', no: 'PC-0004', patient: { name: 'Olivia Bennett', age: 34, gender: 'Female', phone: '+1 (415) 555-0301' }, doctorId: 'd1', type: 'follow-up', followUpOf: 'b1', items: [{ label: 'Follow-up visit (free within 7 days)', amount: 0 }], discount: 0, total: 0, method: 'Cash', date: '2026-06-27', time: '09:00', createdBy: 'Sofia Reyes' },
  { id: 'b5', no: 'PC-0005', patient: { name: 'Henry Taylor', age: 70, gender: 'Male', phone: '+1 (415) 555-0304' }, doctorId: 'd4', type: 'consultation', items: [{ label: 'Consultation fee', amount: 220 }, { label: 'EEG', amount: 150 }], discount: 0, total: 370, method: 'Card', date: '2026-06-29', time: '08:45', createdBy: 'Sofia Reyes' },
  { id: 'b6', no: 'PC-0006', patient: { name: 'Sophia Martinez', age: 29, gender: 'Female', phone: '+1 (415) 555-0305' }, doctorId: 'd5', type: 'consultation', items: [{ label: 'Consultation fee', amount: 160 }], discount: 0, total: 160, method: 'UPI', date: '2026-06-29', time: '10:10', createdBy: 'Sofia Reyes' },
  { id: 'b7', no: 'PC-0007', patient: { name: 'Ava Rodriguez', age: 5, gender: 'Female', phone: '+1 (415) 555-0306' }, doctorId: 'd8', type: 'consultation', items: [{ label: 'Consultation fee', amount: 120 }, { label: 'Nebulisation', amount: 40 }], discount: 0, total: 160, method: 'Cash', date: '2026-06-29', time: '13:35', createdBy: 'Amelia Hart' },
]

const SEED_MEDICINES = [
  { id: 'm1', name: 'Paracetamol 500mg', category: 'Tablet', unit: 'strip of 10', price: 2.5, stock: 140 },
  { id: 'm2', name: 'Ibuprofen 400mg', category: 'Tablet', unit: 'strip of 10', price: 3.2, stock: 85 },
  { id: 'm3', name: 'Amoxicillin 500mg', category: 'Capsule', unit: 'strip of 10', price: 6.8, stock: 60 },
  { id: 'm4', name: 'Azithromycin 250mg', category: 'Tablet', unit: 'strip of 6', price: 7.5, stock: 14 },
  { id: 'm5', name: 'Cetirizine 10mg', category: 'Tablet', unit: 'strip of 10', price: 1.9, stock: 200 },
  { id: 'm6', name: 'Omeprazole 20mg', category: 'Capsule', unit: 'strip of 14', price: 4.4, stock: 72 },
  { id: 'm7', name: 'Cough syrup (Dextromethorphan)', category: 'Syrup', unit: '100 ml bottle', price: 5.5, stock: 38 },
  { id: 'm8', name: 'ORS sachet', category: 'Other', unit: 'sachet', price: 0.6, stock: 300 },
  { id: 'm9', name: 'Salbutamol inhaler', category: 'Inhaler', unit: '200 doses', price: 12.0, stock: 18 },
  { id: 'm10', name: 'Metformin 500mg', category: 'Tablet', unit: 'strip of 10', price: 2.8, stock: 120 },
  { id: 'm11', name: 'Amlodipine 5mg', category: 'Tablet', unit: 'strip of 10', price: 3.0, stock: 95 },
  { id: 'm12', name: 'Atorvastatin 10mg', category: 'Tablet', unit: 'strip of 10', price: 4.9, stock: 64 },
  { id: 'm13', name: 'Hydrocortisone 1% cream', category: 'Ointment', unit: '15 g tube', price: 3.7, stock: 41 },
  { id: 'm14', name: 'Eye drops (Carboxymethylcellulose)', category: 'Drops', unit: '10 ml', price: 4.2, stock: 9 },
  { id: 'm15', name: 'Vitamin D3 60k IU', category: 'Capsule', unit: 'strip of 4', price: 3.9, stock: 110 },
  { id: 'm16', name: 'Insulin glargine', category: 'Injection', unit: '3 ml pen', price: 28.0, stock: 12 },
]

const SEED_PHARMACY_BILLS = [
  { id: 'p1', no: 'PH-0001', customer: { name: 'Olivia Bennett', phone: '+1 (415) 555-0301', age: 34 }, doctorId: 'd1', items: [{ medicineId: 'm11', name: 'Amlodipine 5mg', qty: 2, price: 3.0, total: 6.0 }, { medicineId: 'm12', name: 'Atorvastatin 10mg', qty: 1, price: 4.9, total: 4.9 }], subtotal: 10.9, discount: 0, total: 10.9, method: 'Card', date: '2026-06-22', time: '09:48', createdBy: 'Aisha Khan' },
  { id: 'p2', no: 'PH-0002', customer: { name: 'Mia Wilson', phone: '+1 (415) 555-0303', age: 31 }, doctorId: 'd3', items: [{ medicineId: 'm1', name: 'Paracetamol 500mg', qty: 1, price: 2.5, total: 2.5 }, { medicineId: 'm5', name: 'Cetirizine 10mg', qty: 1, price: 1.9, total: 1.9 }, { medicineId: 'm7', name: 'Cough syrup (Dextromethorphan)', qty: 1, price: 5.5, total: 5.5 }], subtotal: 9.9, discount: 0, total: 9.9, method: 'Cash', date: '2026-06-25', time: '12:02', createdBy: 'Aisha Khan' },
  { id: 'p3', no: 'PH-0003', customer: { name: 'Olivia Bennett', phone: '+1 (415) 555-0301', age: 34 }, doctorId: 'd1', items: [{ medicineId: 'm11', name: 'Amlodipine 5mg', qty: 3, price: 3.0, total: 9.0 }], subtotal: 9.0, discount: 0, total: 9.0, method: 'Cash', date: '2026-06-27', time: '09:31', createdBy: 'Aisha Khan' },
  { id: 'p4', no: 'PH-0004', customer: { name: 'Henry Taylor', phone: '+1 (415) 555-0304', age: 70 }, doctorId: 'd4', items: [{ medicineId: 'm6', name: 'Omeprazole 20mg', qty: 1, price: 4.4, total: 4.4 }, { medicineId: 'm15', name: 'Vitamin D3 60k IU', qty: 2, price: 3.9, total: 7.8 }], subtotal: 12.2, discount: 0.2, total: 12.0, method: 'UPI', date: '2026-06-29', time: '09:15', createdBy: 'Aisha Khan' },
  { id: 'p5', no: 'PH-0005', customer: { name: 'Ava Rodriguez', phone: '+1 (415) 555-0306', age: 5 }, doctorId: 'd8', items: [{ medicineId: 'm9', name: 'Salbutamol inhaler', qty: 1, price: 12.0, total: 12.0 }, { medicineId: 'm8', name: 'ORS sachet', qty: 6, price: 0.6, total: 3.6 }], subtotal: 15.6, discount: 0, total: 15.6, method: 'Cash', date: '2026-06-29', time: '13:50', createdBy: 'Aisha Khan' },
]

/* ============================================================
   CONSULTATION BILLS
   ============================================================ */
const seedBills = () => write(KEYS.bills, SEED_BILLS)
export const getBills = () => read(KEYS.bills, null) || seedBills()
export const getBill = (id) => getBills().find((b) => b.id === id) || null

const nextNo = (list, prefix) => {
  const max = list.reduce((m, b) => Math.max(m, Number(b.no?.split('-')[1]) || 0), 0)
  return `${prefix}-${String(max + 1).padStart(4, '0')}`
}

export const validUntil = (bill) => addDays(bill.date, VALIDITY_DAYS)
export const isValid = (bill, on = TODAY) => bill.type === 'consultation' && bill.total > 0 && on >= bill.date && on <= validUntil(bill)

/** All paid consultation bills for this patient with this doctor that are still within the 7-day window. */
export const activeValidity = (patientName, doctorId, on = TODAY) => {
  const n = norm(patientName)
  if (!n) return null
  return getBills()
    .filter((b) => norm(b.patient.name) === n && (!doctorId || b.doctorId === doctorId) && isValid(b, on))
    .sort((a, b) => b.date.localeCompare(a.date))[0] || null
}

/** Distinct patients seen so far (for autocomplete + history). */
export const knownPatients = () => {
  const map = {}
  getBills().forEach((b) => {
    const k = norm(b.patient.name)
    if (!map[k]) map[k] = { ...b.patient, visits: 0, lastVisit: b.date, lastDoctorId: b.doctorId }
    map[k].visits += 1
    if (b.date >= map[k].lastVisit) { map[k].lastVisit = b.date; map[k].lastDoctorId = b.doctorId }
  })
  return Object.values(map).sort((a, b) => b.lastVisit.localeCompare(a.lastVisit))
}

export const patientBills = (name) => getBills().filter((b) => norm(b.patient.name) === norm(name)).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))

/** Create a bill. If a valid consultation exists for the same patient+doctor, it becomes a free follow-up. */
export const createBill = ({ patient, doctorId, extras = [], discount = 0, method = 'Cash', note = '', createdBy = 'Admin', forceCharge = false }) => {
  const doc = getDoctor(doctorId)
  const prior = forceCharge ? null : activeValidity(patient.name, doctorId)
  const items = prior
    ? [{ label: `Follow-up visit (free until ${validUntil(prior)})`, amount: 0 }]
    : [{ label: 'Consultation fee', amount: Number(doc?.fee) || 0 }]
  extras.filter((e) => e.label?.trim() && Number(e.amount) > 0).forEach((e) => items.push({ label: e.label.trim(), amount: Number(e.amount) }))
  const subtotal = items.reduce((a, i) => a + i.amount, 0)
  const disc = Math.min(Number(discount) || 0, subtotal)
  const bills = getBills()
  const bill = {
    id: uid('b'), no: nextNo(bills, 'PC'),
    patient: { name: patient.name.trim(), age: Number(patient.age) || null, gender: patient.gender || '', phone: patient.phone || '' },
    doctorId, type: prior ? 'follow-up' : 'consultation', followUpOf: prior?.id,
    items, discount: disc, total: r2(subtotal - disc), method, note,
    date: TODAY, time: nowTime(), createdBy,
  }
  write(KEYS.bills, [bill, ...bills])
  return bill
}

export const deleteBill = (id) => write(KEYS.bills, getBills().filter((b) => b.id !== id))

/* ---------- totals ---------- */
const monthOf = (iso) => iso.slice(0, 7)
const weekStart = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  return addDays(iso, -((dt.getDay() + 6) % 7))
}
export const inRange = (date, range) => {
  if (range === 'today') return date === TODAY
  if (range === 'week') return date >= weekStart(TODAY) && date <= TODAY
  if (range === 'month') return monthOf(date) === monthOf(TODAY)
  return true
}
const sum = (list) => r2(list.reduce((a, b) => a + (b.total || 0), 0))

export const billingSummary = () => {
  const bills = getBills()
  const ph = getPharmacyBills()
  const todayB = bills.filter((b) => b.date === TODAY)
  const todayP = ph.filter((b) => b.date === TODAY)
  const byDoctor = {}
  todayB.forEach((b) => { byDoctor[b.doctorId] = (byDoctor[b.doctorId] || 0) + b.total })
  const byMethod = {}
  todayB.forEach((b) => { byMethod[b.method] = (byMethod[b.method] || 0) + b.total })
  return {
    today: sum(todayB), todayCount: todayB.length, todayFollowUps: todayB.filter((b) => b.type === 'follow-up').length,
    week: sum(bills.filter((b) => inRange(b.date, 'week'))),
    month: sum(bills.filter((b) => inRange(b.date, 'month'))),
    all: sum(bills), count: bills.length,
    pharmacyToday: sum(todayP), pharmacyMonth: sum(ph.filter((b) => inRange(b.date, 'month'))), pharmacyAll: sum(ph),
    combinedToday: r2(sum(todayB) + sum(todayP)),
    byDoctor: Object.entries(byDoctor).map(([id, total]) => ({ doctor: getDoctor(id), total })).sort((a, b) => b.total - a.total),
    byMethod,
  }
}

/* ============================================================
   MEDICINES (catalog)
   ============================================================ */
const seedMeds = () => write(KEYS.medicines, SEED_MEDICINES)
export const getMedicines = () => read(KEYS.medicines, null) || seedMeds()
export const getMedicine = (id) => getMedicines().find((m) => m.id === id) || null
export const addMedicine = (data) => {
  const rec = { id: uid('m'), stock: 0, price: 0, category: 'Tablet', unit: '', ...data, price: Number(data.price) || 0, stock: Number(data.stock) || 0 }
  write(KEYS.medicines, [...getMedicines(), rec])
  return rec
}
export const updateMedicine = (id, patch) =>
  write(KEYS.medicines, getMedicines().map((m) => (m.id === id ? { ...m, ...patch } : m)))
export const deleteMedicine = (id) => write(KEYS.medicines, getMedicines().filter((m) => m.id !== id))
export const restock = (id, qty) => {
  const m = getMedicine(id)
  if (m) updateMedicine(id, { stock: m.stock + Number(qty) })
}

/* ============================================================
   PHARMACY BILLS
   ============================================================ */
const seedPh = () => write(KEYS.pharmacyBills, SEED_PHARMACY_BILLS)
export const getPharmacyBills = () => read(KEYS.pharmacyBills, null) || seedPh()

/** Distinct pharmacy customers (name → summary) for the lookup box. */
export const knownCustomers = () => {
  const map = {}
  getPharmacyBills().forEach((b) => {
    const k = norm(b.customer.name)
    if (!map[k]) map[k] = { ...b.customer, purchases: 0, lastVisit: b.date, spent: 0 }
    map[k].purchases += 1
    map[k].spent = r2(map[k].spent + b.total)
    if (b.date >= map[k].lastVisit) map[k].lastVisit = b.date
  })
  return Object.values(map).sort((a, b) => b.lastVisit.localeCompare(a.lastVisit))
}

/** Purchase history for a customer: bills (newest first) + flattened medicine list with last-bought date. */
export const customerHistory = (name) => {
  const bills = getPharmacyBills().filter((b) => norm(b.customer.name) === norm(name)).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))
  const meds = {}
  bills.forEach((b) => b.items.forEach((i) => {
    const k = i.medicineId || i.name
    if (!meds[k]) meds[k] = { medicineId: i.medicineId, name: i.name, qty: 0, times: 0, last: b.date }
    meds[k].qty += i.qty
    meds[k].times += 1
    if (b.date > meds[k].last) meds[k].last = b.date
  }))
  return { bills, medicines: Object.values(meds).sort((a, b) => b.last.localeCompare(a.last)), spent: sum(bills) }
}

/** Sell: creates the bill and reduces stock. `items` = [{ medicineId, qty }]. */
export const createPharmacyBill = ({ customer, items, discount = 0, method = 'Cash', doctorId = '', createdBy = 'Pharmacy' }) => {
  const meds = getMedicines()
  const lines = items.map((i) => {
    const m = meds.find((x) => x.id === i.medicineId)
    const qty = Math.max(1, Number(i.qty) || 1)
    return { medicineId: m.id, name: m.name, unit: m.unit, qty, price: m.price, total: r2(m.price * qty) }
  })
  const subtotal = r2(lines.reduce((a, l) => a + l.total, 0))
  const disc = Math.min(Number(discount) || 0, subtotal)
  const bills = getPharmacyBills()
  const bill = {
    id: uid('p'), no: nextNo(bills, 'PH'),
    customer: { name: customer.name.trim(), phone: customer.phone || '', age: Number(customer.age) || null },
    doctorId: doctorId || '', items: lines, subtotal, discount: disc, total: r2(subtotal - disc), method,
    date: TODAY, time: nowTime(), createdBy,
  }
  write(KEYS.pharmacyBills, [bill, ...bills])
  write(KEYS.medicines, meds.map((m) => {
    const sold = lines.filter((l) => l.medicineId === m.id).reduce((a, l) => a + l.qty, 0)
    return sold ? { ...m, stock: Math.max(0, m.stock - sold) } : m
  }))
  return bill
}

export const deletePharmacyBill = (id) => write(KEYS.pharmacyBills, getPharmacyBills().filter((b) => b.id !== id))

export const resetBillingData = () => Object.values(KEYS).forEach((k) => localStorage.removeItem(k))

export { getDoctors, getDoctor }
