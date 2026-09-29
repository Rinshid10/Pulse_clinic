/* ============================================================
   Billing + Pharmacy store (admin console).

   - Consultation bills: patient name/age, doctor, amount, 7-day
     validity → a return visit to the same doctor within 7 days
     is a free follow-up.
   - Pharmacy: medicine catalog with stock, per-customer bills,
     purchase history looked up by customer name.

   Same localStorage + `pulse:store` event mechanism as clinicStore.
   ============================================================ */

import { read, write, uid, subscribe, TODAY, getDoctors, getDoctor, addNotification } from './clinicStore'
import { BILLS as SEED_BILLS, MEDICINES as SEED_MEDICINES, PHARMACY_BILLS as SEED_PHARMACY_BILLS, MEDICINE_REQUESTS as SEED_REQUESTS } from '../data/billing'

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

/* ============================================================
   MEDICINE REQUESTS — pharmacy desk asks admin for restock / new medicines
   ============================================================ */
KEYS.medicineRequests = 'pulse-medicine-requests'

export const getMedicineRequests = () => read(KEYS.medicineRequests, null) || write(KEYS.medicineRequests, SEED_REQUESTS)
export const pendingMedicineRequests = () => getMedicineRequests().filter((r) => r.status === 'pending').length

/** kind: 'restock' (medicineId + qty) or 'new' (name, category, unit, qty, price). */
export const requestMedicine = (data) => {
  const med = data.medicineId ? getMedicine(data.medicineId) : null
  const rec = { id: uid('mr'), status: 'pending', date: TODAY, ...data, name: med?.name || data.name, qty: Number(data.qty) || 0, price: Number(data.price) || 0 }
  write(KEYS.medicineRequests, [rec, ...getMedicineRequests()])
  addNotification({ type: 'system', title: rec.kind === 'new' ? 'New medicine suggested' : 'Restock requested', body: `${rec.by}: ${rec.name} × ${rec.qty}` })
  return rec
}

/** Approving a restock adds stock; approving a new medicine adds it to the catalog. */
export const decideMedicineRequest = (id, status, by, note = '') => {
  const all = getMedicineRequests()
  const rec = all.find((r) => r.id === id)
  if (!rec) return
  write(KEYS.medicineRequests, all.map((r) => (r.id === id ? { ...r, status, decidedBy: by, decidedAt: TODAY, note } : r)))
  if (status !== 'approved') return
  if (rec.kind === 'restock' && rec.medicineId && getMedicine(rec.medicineId)) restock(rec.medicineId, rec.qty)
  else addMedicine({ name: rec.name, category: rec.category || 'Other', unit: rec.unit || '', price: rec.price || 0, stock: rec.qty })
}
