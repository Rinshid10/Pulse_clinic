/* Map between the front-end storage keys (what the stores call `KEYS.*`)
   and MongoDB collections. Array keys become real collections where each
   record's own `id` is the Mongo `_id`; object/scalar keys live in `settings`. */

export const COLLECTIONS = {
  'pulse-doctors': 'doctors',
  'pulse-appointments': 'appointments',
  'pulse-patients': 'patients',
  'pulse-bookings': 'bookings',
  'pulse-notifications': 'notifications',
  'pulse-staff': 'staff',
  'pulse-leave-requests': 'leaveRequests',
  'pulse-shifts': 'shifts',
  'pulse-shift-requests': 'shiftRequests',
  'pulse-overtime': 'overtime',
  'pulse-concerns': 'concerns',
  'pulse-holidays': 'holidays',
  'pulse-payroll-runs': 'payrollRuns',
  'pulse-announcements': 'announcements',
  'pulse-bills': 'bills',
  'pulse-medicines': 'medicines',
  'pulse-pharmacy-bills': 'pharmacyBills',
  'pulse-medicine-requests': 'medicineRequests',
}

/* Non-array values: theme colours, theme mode, homepage content, doctor leave map, leave policy. */
export const SETTINGS_KEYS = ['pulse-theme-colors', 'pulse-theme', 'pulse-content', 'pulse-leaves', 'pulse-leave-policy']

/* Readable without a login (the customer website needs them). */
export const PUBLIC_READ = ['pulse-doctors', 'pulse-content', 'pulse-theme-colors', 'pulse-theme', 'pulse-leaves', 'pulse-bookings']
/* Writable without a login (customers create/cancel their own bookings). */
export const PUBLIC_WRITE = ['pulse-bookings']

export const ALL_KEYS = [...Object.keys(COLLECTIONS), ...SETTINGS_KEYS]
export const collectionFor = (key) => COLLECTIONS[key] || null
export const keyFor = (collection) => Object.keys(COLLECTIONS).find((k) => COLLECTIONS[k] === collection) || null
export const isSettingsKey = (key) => SETTINGS_KEYS.includes(key)

/* Which consoles each seeded login can open, and the role inside each. */
export const APPS = ['admin', 'staff', 'hr', 'billing', 'pharmacy']
