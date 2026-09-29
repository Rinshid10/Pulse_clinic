/* ============================================================
   Seed data + constants for the Staff Portal (/staff).
   Dates are anchored to TODAY (2026-06-29) like the rest of the app.
   ============================================================ */

export const LEAVE_TYPES = {
  annual:    { label: 'Annual leave',    quota: 20, color: '#4f6cf7', paid: true },
  sick:      { label: 'Sick leave',      quota: 10, color: '#ef4444', paid: true, needsCert: true },
  casual:    { label: 'Casual leave',    quota: 6,  color: '#f59e0b', paid: true },
  maternity: { label: 'Maternity leave', quota: 90, color: '#a855f7', paid: true },
  unpaid:    { label: 'Unpaid leave',    quota: 0,  color: '#64748b', paid: false },
}

export const SHIFTS = {
  morning: { label: 'Morning', start: '07:00', end: '15:00', color: '#f59e0b', bg: '#fff4d6' },
  evening: { label: 'Evening', start: '15:00', end: '23:00', color: '#4f6cf7', bg: '#e6ebff' },
  night:   { label: 'Night',   start: '23:00', end: '07:00', color: '#a855f7', bg: '#f1e6ff' },
  off:     { label: 'Off',     start: '',      end: '',      color: '#94a3b8', bg: '#f1f5f9' },
}

export const WARDS = ['General', 'ICU', 'Cardiology', 'Pediatrics', 'OPD', 'Emergency', 'Pharmacy', 'Lab', 'Front desk']

export const STAFF_ROLES = { staff: 'Staff', manager: 'Manager', hr: 'HR' }

export const DEPARTMENTS = ['Nursing', 'Cardiology', 'Pediatrics', 'Dermatology', 'Orthopedics', 'Neurology', 'Dentistry', 'Pharmacy', 'Laboratory', 'Front desk', 'Administration']

export const CONCERN_CATEGORIES = ['Salary / payment', 'Overtime hours', 'Schedule / roster', 'Leave', 'Workplace / facility', 'HR / policy', 'Other']

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export const REQUEST_STATUS = {
  pending:   { label: 'Pending',   kind: 'amber' },
  approved:  { label: 'Approved',  kind: 'green' },
  rejected:  { label: 'Rejected',  kind: 'red' },
  cancelled: { label: 'Cancelled', kind: 'gray' },
}

export const CONCERN_STATUS = {
  open:          { label: 'Open',        kind: 'amber' },
  'in-progress': { label: 'In progress', kind: 'blue' },
  resolved:      { label: 'Resolved',    kind: 'green' },
}

const quota = () => ({ annual: 20, sick: 10, casual: 6, maternity: 90 })

/* Password for every demo account: staff123 */
export const STAFF = [
  {
    id: 's1', empId: 'PC-1001', name: 'Priya Nair', email: 'priya@pulse.com', password: 'staff123', role: 'staff',
    dept: 'Nursing', designation: 'Senior Nurse', phone: '+1 (415) 555-0201', joinDate: '2021-03-15', color: '#10c8a3',
    address: '12 Harbor St, San Francisco', gender: 'Female', dob: '1991-08-12',
    emergency: { name: 'Arun Nair', relation: 'Spouse', phone: '+1 (415) 555-0202' },
    health: { heightCm: 162, weightKg: 58, bloodGroup: 'O+', allergies: 'Penicillin', conditions: 'None', notes: '' },
    salary: { basic: 4200, hra: 840, allowances: 300, deductions: 260, otRate: 32 },
    leaveQuota: quota(), active: true,
  },
  {
    id: 's2', empId: 'PC-1002', name: 'Daniel Okafor', email: 'daniel@pulse.com', password: 'staff123', role: 'staff',
    dept: 'Nursing', designation: 'Staff Nurse', phone: '+1 (415) 555-0203', joinDate: '2022-09-01', color: '#4f6cf7',
    address: '88 Mission Ave, San Francisco', gender: 'Male', dob: '1995-02-20',
    emergency: { name: 'Grace Okafor', relation: 'Mother', phone: '+1 (415) 555-0204' },
    health: { heightCm: 178, weightKg: 80, bloodGroup: 'A+', allergies: 'None', conditions: 'Mild asthma', notes: 'Inhaler on file' },
    salary: { basic: 3600, hra: 720, allowances: 250, deductions: 220, otRate: 28 },
    leaveQuota: quota(), active: true,
  },
  {
    id: 's3', empId: 'PC-1003', name: 'Dr. Sarah Chen', email: 'sarah@pulse.com', password: 'staff123', role: 'staff', doctorId: 'd1',
    dept: 'Cardiology', designation: 'Senior Cardiologist', phone: '+1 (415) 555-0148', joinDate: '2012-05-10', color: '#4f6cf7',
    address: '5 Pine Hill Rd, San Francisco', gender: 'Female', dob: '1982-11-03',
    emergency: { name: 'Michael Chen', relation: 'Spouse', phone: '+1 (415) 555-0149' },
    health: { heightCm: 165, weightKg: 60, bloodGroup: 'B+', allergies: 'None', conditions: 'None', notes: '' },
    salary: { basic: 11000, hra: 2200, allowances: 900, deductions: 640, otRate: 85 },
    leaveQuota: quota(), active: true,
  },
  {
    id: 's4', empId: 'PC-1004', name: 'Dr. James Wilson', email: 'james@pulse.com', password: 'staff123', role: 'staff', doctorId: 'd2',
    dept: 'Orthopedics', designation: 'Orthopedic Surgeon', phone: '+1 (415) 555-0150', joinDate: '2015-01-20', color: '#f59e0b',
    address: '40 Ocean View, Daly City', gender: 'Male', dob: '1980-06-25',
    emergency: { name: 'Laura Wilson', relation: 'Spouse', phone: '+1 (415) 555-0151' },
    health: { heightCm: 183, weightKg: 88, bloodGroup: 'O-', allergies: 'Latex', conditions: 'None', notes: '' },
    salary: { basic: 10500, hra: 2100, allowances: 900, deductions: 620, otRate: 85 },
    leaveQuota: quota(), active: true,
  },
  {
    id: 's5', empId: 'PC-1005', name: 'Sofia Reyes', email: 'sofia@pulse.com', password: 'staff123', role: 'staff',
    dept: 'Front desk', designation: 'Receptionist', phone: '+1 (415) 555-0205', joinDate: '2023-02-13', color: '#f59e0b',
    address: '210 Valencia St, San Francisco', gender: 'Female', dob: '1998-04-17',
    emergency: { name: 'Carlos Reyes', relation: 'Father', phone: '+1 (415) 555-0206' },
    health: { heightCm: 158, weightKg: 54, bloodGroup: 'AB+', allergies: 'Dust', conditions: 'None', notes: '' },
    salary: { basic: 2800, hra: 560, allowances: 150, deductions: 180, otRate: 22 },
    leaveQuota: quota(), active: true,
  },
  {
    id: 's6', empId: 'PC-1006', name: 'Kevin Tran', email: 'kevin@pulse.com', password: 'staff123', role: 'staff',
    dept: 'Laboratory', designation: 'Lab Technician', phone: '+1 (415) 555-0207', joinDate: '2020-07-06', color: '#a855f7',
    address: '7 Sunset Blvd, San Francisco', gender: 'Male', dob: '1993-12-01',
    emergency: { name: 'Linh Tran', relation: 'Sister', phone: '+1 (415) 555-0208' },
    health: { heightCm: 172, weightKg: 70, bloodGroup: 'A-', allergies: 'None', conditions: 'None', notes: '' },
    salary: { basic: 3400, hra: 680, allowances: 200, deductions: 210, otRate: 26 },
    leaveQuota: quota(), active: true,
  },
  {
    id: 's7', empId: 'PC-1007', name: 'Aisha Khan', email: 'aisha@pulse.com', password: 'staff123', role: 'staff',
    dept: 'Pharmacy', designation: 'Pharmacist', phone: '+1 (415) 555-0209', joinDate: '2019-11-18', color: '#ef4444',
    address: '33 Lakeside Dr, Oakland', gender: 'Female', dob: '1990-09-09',
    emergency: { name: 'Omar Khan', relation: 'Brother', phone: '+1 (415) 555-0210' },
    health: { heightCm: 160, weightKg: 62, bloodGroup: 'B-', allergies: 'Shellfish', conditions: 'None', notes: '' },
    salary: { basic: 4000, hra: 800, allowances: 250, deductions: 240, otRate: 30 },
    leaveQuota: quota(), active: true,
  },
  {
    id: 's8', empId: 'PC-1008', name: 'Marcus Lee', email: 'manager@pulse.com', password: 'staff123', role: 'manager',
    dept: 'Administration', designation: 'Operations Manager', phone: '+1 (415) 555-0211', joinDate: '2016-04-04', color: '#10c8a3',
    address: '19 Bay St, San Francisco', gender: 'Male', dob: '1985-03-30',
    emergency: { name: 'Hana Lee', relation: 'Spouse', phone: '+1 (415) 555-0212' },
    health: { heightCm: 176, weightKg: 78, bloodGroup: 'O+', allergies: 'None', conditions: 'None', notes: '' },
    salary: { basic: 6500, hra: 1300, allowances: 600, deductions: 400, otRate: 0 },
    leaveQuota: quota(), active: true,
  },
  {
    id: 's9', empId: 'PC-1009', name: 'Amelia Hart', email: 'hr@pulse.com', password: 'staff123', role: 'hr',
    dept: 'Administration', designation: 'HR Lead', phone: '+1 (415) 555-0213', joinDate: '2017-08-21', color: '#4f6cf7',
    address: '3 Garden Ct, Berkeley', gender: 'Female', dob: '1987-07-14',
    emergency: { name: 'Tom Hart', relation: 'Spouse', phone: '+1 (415) 555-0214' },
    health: { heightCm: 168, weightKg: 64, bloodGroup: 'A+', allergies: 'None', conditions: 'None', notes: '' },
    salary: { basic: 6000, hra: 1200, allowances: 500, deductions: 380, otRate: 0 },
    leaveQuota: quota(), active: true,
  },
]

/* ---------- Roster: 3 weeks around TODAY (Mon 2026-06-22 → Sun 2026-07-12) ---------- */
const addDays = (iso, n) => {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, m - 1, d + n)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
}
const PATTERN = {
  s1: ['morning', 'morning', 'evening', 'evening', 'off', 'night', 'night'],
  s2: ['evening', 'evening', 'night', 'night', 'off', 'morning', 'morning'],
  s3: ['morning', 'morning', 'morning', 'morning', 'morning', 'off', 'off'],
  s4: ['morning', 'morning', 'evening', 'evening', 'morning', 'off', 'off'],
  s5: ['morning', 'morning', 'morning', 'evening', 'evening', 'off', 'off'],
  s6: ['night', 'night', 'off', 'morning', 'morning', 'evening', 'evening'],
  s7: ['morning', 'evening', 'morning', 'evening', 'morning', 'off', 'off'],
  s8: ['morning', 'morning', 'morning', 'morning', 'morning', 'off', 'off'],
  s9: ['morning', 'morning', 'morning', 'morning', 'morning', 'off', 'off'],
}
const WARD_OF = { s1: 'ICU', s2: 'General', s3: 'Cardiology', s4: 'Orthopedics', s5: 'Front desk', s6: 'Lab', s7: 'Pharmacy', s8: 'General', s9: 'General' }

export const SHIFTS_SEED = []
const START = '2026-06-22'
for (let day = 0; day < 21; day++) {
  const date = addDays(START, day)
  for (const staffId of Object.keys(PATTERN)) {
    SHIFTS_SEED.push({ id: `sh-${staffId}-${date}`, staffId, date, shift: PATTERN[staffId][day % 7], ward: WARD_OF[staffId] })
  }
}

export const LEAVE_REQUESTS = [
  { id: 'lr1', staffId: 's1', type: 'annual', from: '2026-05-04', to: '2026-05-08', days: 5, halfDay: false, reason: 'Family trip', status: 'approved', appliedAt: '2026-04-10', reviewedBy: 'Marcus Lee', reviewedAt: '2026-04-12', note: 'Enjoy!' },
  { id: 'lr2', staffId: 's1', type: 'sick', from: '2026-06-10', to: '2026-06-11', days: 2, halfDay: false, reason: 'Fever and flu', status: 'approved', appliedAt: '2026-06-10', reviewedBy: 'Amelia Hart', reviewedAt: '2026-06-10', note: '', medicalCert: { name: 'clinic-note.pdf' } },
  { id: 'lr3', staffId: 's2', type: 'casual', from: '2026-07-03', to: '2026-07-03', days: 1, halfDay: false, reason: 'Personal errand', status: 'pending', appliedAt: '2026-06-27' },
  { id: 'lr4', staffId: 's6', type: 'annual', from: '2026-07-13', to: '2026-07-17', days: 5, halfDay: false, reason: 'Vacation', status: 'pending', appliedAt: '2026-06-25' },
  { id: 'lr5', staffId: 's7', type: 'casual', from: '2026-06-19', to: '2026-06-19', days: 1, halfDay: false, reason: 'Moving house', status: 'rejected', appliedAt: '2026-06-15', reviewedBy: 'Marcus Lee', reviewedAt: '2026-06-16', note: 'Pharmacy short-staffed that day' },
  { id: 'lr6', staffId: 's4', type: 'annual', from: '2026-06-15', to: '2026-06-17', days: 3, halfDay: false, reason: 'Conference', status: 'approved', appliedAt: '2026-06-01', reviewedBy: 'Marcus Lee', reviewedAt: '2026-06-02', note: '' },
  { id: 'lr7', staffId: 's5', type: 'sick', from: '2026-06-30', to: '2026-06-30', days: 1, halfDay: false, reason: 'Dental procedure', status: 'pending', appliedAt: '2026-06-28', medicalCert: { name: 'dentist-appointment.jpg' } },
]

export const SHIFT_REQUESTS = [
  { id: 'sr1', kind: 'swap', fromStaffId: 's2', toStaffId: 's1', shiftId: 'sh-s2-2026-07-01', targetShiftId: 'sh-s1-2026-07-01', reason: 'Evening class on Wednesday', status: 'pending', createdAt: '2026-06-27' },
  { id: 'sr2', kind: 'handover', fromStaffId: 's6', toStaffId: 's2', shiftId: 'sh-s6-2026-06-23', targetShiftId: null, reason: 'Car breakdown', status: 'approved', createdAt: '2026-06-22', decidedBy: 'Marcus Lee', decidedAt: '2026-06-22' },
]

export const OVERTIME = [
  { id: 'ot1', staffId: 's1', date: '2026-06-03', hours: 3, reason: 'ICU cover for absent colleague', status: 'approved', rate: 32, amount: 96, decidedBy: 'Marcus Lee' },
  { id: 'ot2', staffId: 's1', date: '2026-06-18', hours: 2, reason: 'Late discharge paperwork', status: 'approved', rate: 32, amount: 64, decidedBy: 'Marcus Lee' },
  { id: 'ot3', staffId: 's1', date: '2026-06-27', hours: 4, reason: 'Emergency admissions surge', status: 'pending', rate: 32, amount: 128 },
  { id: 'ot4', staffId: 's2', date: '2026-06-21', hours: 2.5, reason: 'Night shift extension', status: 'pending', rate: 28, amount: 70 },
  { id: 'ot5', staffId: 's6', date: '2026-06-12', hours: 3, reason: 'Urgent lab results batch', status: 'approved', rate: 26, amount: 78, decidedBy: 'Marcus Lee' },
  { id: 'ot6', staffId: 's7', date: '2026-06-08', hours: 1.5, reason: 'Stock audit', status: 'rejected', rate: 30, amount: 45, decidedBy: 'Marcus Lee', note: 'Audit was within regular hours' },
]

export const CONCERNS = [
  {
    id: 'c1', staffId: 's1', category: 'Overtime hours', priority: 'high', subject: 'May overtime not reflected in payslip',
    body: 'I logged 5 hours of approved overtime in May but the May payslip shows 0 overtime pay. Could you please check?',
    status: 'in-progress', createdAt: '2026-06-20',
    replies: [{ by: 'Amelia Hart', at: '2026-06-21', text: 'Thanks Priya, checking with payroll. Will update by Friday.' }],
  },
  {
    id: 'c2', staffId: 's5', category: 'Schedule / roster', priority: 'medium', subject: 'Too many consecutive evening shifts',
    body: 'Three evening shifts in a row makes it hard to pick up my kids. Could the roster be spread out?',
    status: 'open', createdAt: '2026-06-26', replies: [],
  },
  {
    id: 'c3', staffId: 's6', category: 'Workplace / facility', priority: 'low', subject: 'Lab AC not working',
    body: 'The air-conditioning in Lab 2 has been out since Monday. Samples need a stable temperature.',
    status: 'resolved', createdAt: '2026-06-10',
    replies: [{ by: 'Marcus Lee', at: '2026-06-11', text: 'Maintenance fixed it this morning. Thanks for flagging.' }],
  },
]

export const HOLIDAYS = [
  { id: 'h1', date: '2026-07-03', name: 'Independence Day (observed)' },
  { id: 'h2', date: '2026-09-07', name: 'Labor Day' },
  { id: 'h3', date: '2026-11-26', name: 'Thanksgiving' },
  { id: 'h4', date: '2026-12-25', name: 'Christmas Day' },
]
export const ANNOUNCEMENTS = [
  { id: 'an1', title: 'Fire drill on Thursday', body: 'A full building fire drill runs Thursday 2 July at 11:00. Please follow ward wardens to assembly point B.', audience: 'all', date: '2026-06-28', by: 'Amelia Hart' },
  { id: 'an2', title: 'New ICU handover template', body: 'From next week, ICU nurses use the updated handover sheet available at the nurses’ station.', audience: 'Nursing', date: '2026-06-26', by: 'Marcus Lee' },
]
