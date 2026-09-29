/* Drops and re-creates every collection with the same demo data the
   front-end used to seed into localStorage.  Run: npm run seed */
import 'dotenv/config'
import { connect, close, DB_NAME } from './db.js'
import { hashPassword } from './auth.js'
import { COLLECTIONS, SETTINGS_KEYS } from './keys.js'
import { DOCTORS, APPOINTMENTS, NOTIFICATIONS } from '../src/data/clinic.js'
import { STAFF, SHIFTS_SEED, LEAVE_REQUESTS, SHIFT_REQUESTS, OVERTIME, CONCERNS, HOLIDAYS, ANNOUNCEMENTS } from '../src/data/staff.js'
import { BILLS, MEDICINES, PHARMACY_BILLS, MEDICINE_REQUESTS } from '../src/data/billing.js'

/* Same derivations clinicStore.js performs on first load. */
const doctors = DOCTORS.map((d) => ({
  active: true,
  availability: { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], start: d.shift?.split(' – ')[0] || '09:00', end: d.shift?.split(' – ')[1] || '17:00', slotMins: 30, holidays: [] },
  ...d,
}))
const patients = (() => {
  const map = new Map()
  APPOINTMENTS.forEach((a) => {
    if (!map.has(a.patient)) {
      map.set(a.patient, {
        id: `p${map.size + 1}`, name: a.patient, age: a.age, gender: a.age % 2 ? 'Male' : 'Female',
        phone: `+1 (415) 555-0${String(100 + map.size).slice(-3)}`, email: `${a.patient.toLowerCase().replace(/[^a-z]/g, '.')}@email.com`,
        bloodGroup: ['A+', 'O+', 'B+', 'AB+', 'O-'][map.size % 5], lastVisit: a.date, visits: 1,
      })
    } else map.get(a.patient).visits += 1
  })
  return [...map.values()]
})()

/* Logins. Staff records sign in with their own email/password; the admin
   console demo accounts are added on top. manager@pulse.com is the same
   person in both, so one login (staff123) opens staff, HR and admin. */
const allApps = ['admin', 'staff', 'hr', 'billing', 'pharmacy']
const users = [
  { _id: 'u1', email: 'admin@pulse.com', password: 'admin123', name: 'Amelia Hart', color: '#4f6cf7', apps: allApps, roles: { admin: 'admin', staff: 'manager', hr: 'hr', billing: 'admin', pharmacy: 'admin' }, designation: 'Administrator' },
  { _id: 'u3', email: 'reception@pulse.com', password: 'admin123', name: 'Sofia Reyes', color: '#f59e0b', apps: ['admin'], roles: { admin: 'receptionist' }, designation: 'Receptionist' },
  { _id: 'bu2', email: 'cashier@pulse.com', password: 'admin123', name: 'Sofia Reyes', color: '#f59e0b', apps: ['billing'], roles: { billing: 'cashier' }, designation: 'Billing desk' },
  { _id: 'pu2', email: 'pharmacy@pulse.com', password: 'admin123', name: 'Aisha Khan', color: '#a855f7', apps: ['pharmacy'], roles: { pharmacy: 'pharmacist' }, designation: 'Pharmacist' },
  ...STAFF.map((s) => {
    const apps = ['staff']
    const roles = { staff: s.role }
    if (s.role === 'hr' || s.role === 'manager') { apps.push('hr'); roles.hr = s.role }
    if (s.email === 'manager@pulse.com') { apps.push('admin'); roles.admin = 'manager' }
    return { _id: s.id, email: s.email, password: s.password, name: s.name, color: s.color, apps, roles, doctorId: s.doctorId || null, designation: s.designation, active: s.active !== false }
  }),
]

const data = {
  doctors, appointments: APPOINTMENTS, patients, bookings: [], notifications: NOTIFICATIONS,
  staff: STAFF, leaveRequests: LEAVE_REQUESTS, shifts: SHIFTS_SEED, shiftRequests: SHIFT_REQUESTS, overtime: OVERTIME, concerns: CONCERNS,
  holidays: HOLIDAYS, payrollRuns: [], announcements: ANNOUNCEMENTS,
  bills: BILLS, medicines: MEDICINES, pharmacyBills: PHARMACY_BILLS, medicineRequests: MEDICINE_REQUESTS,
}
const settings = { 'pulse-theme-colors': {}, 'pulse-theme': 'light', 'pulse-content': {}, 'pulse-leaves': {}, 'pulse-leave-policy': {} }

const db = await connect()
console.log(`Seeding ${DB_NAME} …`)
for (const [name, rows] of Object.entries(data)) {
  const col = db.collection(name)
  await col.deleteMany({})
  if (rows.length) await col.insertMany(rows.map((r, i) => ({ ...r, _id: String(r.id), _order: i })))
  console.log(`  ${name.padEnd(18)} ${String(rows.length).padStart(4)} records`)
}
const s = db.collection('settings')
await s.deleteMany({})
await s.insertMany(Object.entries(settings).map(([k, value]) => ({ _id: k, value })))
console.log(`  ${'settings'.padEnd(18)} ${String(SETTINGS_KEYS.length).padStart(4)} keys`)
const u = db.collection('users')
await u.deleteMany({})
await u.insertMany(users.map(({ password, ...rest }) => ({ ...rest, email: rest.email.toLowerCase(), passwordHash: hashPassword(password) })))
await u.createIndex({ email: 1 }, { unique: true })
console.log(`  ${'users'.padEnd(18)} ${String(users.length).padStart(4)} logins`)
console.log(`Done. Collections: ${Object.values(COLLECTIONS).length} + settings + users.`)
await close()
