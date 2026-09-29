/* ============================================================
   Shared clinic store — single source of truth for BOTH the
   customer website and the admin panel.

   Backed by the Pulse API (Node + MongoDB, see server/). read()
   serves from the in-memory cache filled at startup by api.bootstrap();
   write() updates the cache, mirrors to localStorage as an offline copy,
   notifies listeners and PUTs the key to the server (src/services/api.js).
   ============================================================ */

import {
  DOCTORS as SEED_DOCTORS,
  APPOINTMENTS as SEED_APPTS,
  TESTIMONIALS as SEED_TESTIMONIALS,
  NOTIFICATIONS as SEED_NOTIFICATIONS,
} from '../data/clinic'
import { api, cache } from './api'

export const TODAY = '2026-06-29'

const KEYS = {
  doctors: 'pulse-doctors',
  appointments: 'pulse-appointments',
  patients: 'pulse-patients',
  leaves: 'pulse-leaves',
  themeColors: 'pulse-theme-colors',
  themeMode: 'pulse-theme',
  content: 'pulse-content',
  notifications: 'pulse-notifications',
  bookings: 'pulse-bookings',
}

/* ---------- low-level persistence ---------- */
const read = (key, fallback) => {
  if (cache.has(key)) return cache.get(key)
  try {
    const raw = localStorage.getItem(key)
    if (raw == null) return fallback
    const v = JSON.parse(raw)
    cache.set(key, v)
    return v
  } catch {
    return fallback
  }
}

const write = (key, value) => {
  cache.set(key, value)
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* offline copy is best effort */ }
  // notify same-tab listeners (the native 'storage' event only fires cross-tab)
  window.dispatchEvent(new CustomEvent('pulse:store', { detail: { key } }))
  api.sync(key, value)
  return value
}

/** Subscribe to any store change. Returns an unsubscribe fn. */
export function subscribe(handler) {
  const local = (e) => handler(e.detail?.key)
  const cross = (e) => handler(e.key)
  window.addEventListener('pulse:store', local)
  window.addEventListener('storage', cross)
  return () => {
    window.removeEventListener('pulse:store', local)
    window.removeEventListener('storage', cross)
  }
}

const uid = (p) => `${p}-${Date.now()}-${Math.floor(performance.now() % 100000)}`
/* Shared with src/services/staffStore.js so both stores emit the same change event. */
export { read, write, uid }

/* ============================================================
   DOCTORS
   ============================================================ */
const seedDoctors = () =>
  SEED_DOCTORS.map((d) => ({
    active: true,
    availability: {
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      start: d.shift?.split(' – ')[0] || '09:00',
      end: d.shift?.split(' – ')[1] || '17:00',
      slotMins: 30,
      holidays: [],
    },
    ...d,
  }))

export const getDoctors = () => {
  let list = read(KEYS.doctors, null)
  if (!list) list = write(KEYS.doctors, seedDoctors())
  return list
}
export const getDoctor = (id) => getDoctors().find((d) => d.id === id)
export const saveDoctors = (list) => write(KEYS.doctors, list)

export const addDoctor = (data) => {
  const list = getDoctors()
  const doc = {
    id: uid('d'),
    rating: 4.8, reviews: 0, patients: 0, status: 'available', active: true,
    color: data.color || '#4f6cf7',
    languages: data.languages || ['English'],
    availability: { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], start: '09:00', end: '17:00', slotMins: 30, holidays: [] },
    bio: '', room: 'A-100', fee: 120, phone: '', email: '', experience: 1, days: 'Mon–Fri', shift: '09:00 – 17:00',
    ...data,
  }
  return saveDoctors([doc, ...list])
}
export const updateDoctor = (id, patch) =>
  saveDoctors(getDoctors().map((d) => (d.id === id ? { ...d, ...patch } : d)))
export const deleteDoctor = (id) => saveDoctors(getDoctors().filter((d) => d.id !== id))
export const setDoctorActive = (id, active) => updateDoctor(id, { active })

/* ============================================================
   TODAY LEAVE  (full-day / half-day, with reason)
   leaves shape: { [doctorId]: { type:'full'|'half', half:'am'|'pm', reason, date } }
   ============================================================ */
export const getLeaves = () => read(KEYS.leaves, {})
export const getLeave = (doctorId) => {
  const l = getLeaves()[doctorId]
  return l && l.date === TODAY ? l : null
}
export const isOnLeaveToday = (doctorId) => !!getLeave(doctorId)
export const setLeave = (doctorId, leave) => {
  const all = getLeaves()
  if (!leave) delete all[doctorId]
  else all[doctorId] = { date: TODAY, ...leave }
  return write(KEYS.leaves, all)
}

/* Slots a customer can still book today, respecting half-day leave. */
export const availableSlotsToday = (doctorId, allSlots) => {
  const leave = getLeave(doctorId)
  if (!leave) return allSlots
  if (leave.type === 'full') return []
  // half-day: am hides slots before 13:00, pm hides slots from 13:00
  return allSlots.filter((t) => {
    const h = parseInt(t.split(':')[0], 10)
    return leave.half === 'am' ? h >= 13 : h < 13
  })
}

/* ============================================================
   APPOINTMENTS
   ============================================================ */
const seedAppts = () => SEED_APPTS.map((a) => ({ ...a }))
export const getAppointments = () => {
  let list = read(KEYS.appointments, null)
  if (!list) list = write(KEYS.appointments, seedAppts())
  return list
}
export const saveAppointments = (list) => write(KEYS.appointments, list)
export const updateAppointment = (id, patch) =>
  saveAppointments(getAppointments().map((a) => (a.id === id ? { ...a, ...patch } : a)))
export const setAppointmentStatus = (id, status) => updateAppointment(id, { status })

/* ============================================================
   PATIENTS  (derived seed from appointments + extra detail)
   ============================================================ */
const seedPatients = () => {
  const map = new Map()
  SEED_APPTS.forEach((a) => {
    if (!map.has(a.patient)) {
      map.set(a.patient, {
        id: uid('p'),
        name: a.patient,
        age: a.age,
        gender: a.age % 2 ? 'Male' : 'Female',
        phone: `+1 (415) 555-0${String(100 + map.size).slice(-3)}`,
        email: `${a.patient.toLowerCase().replace(/[^a-z]/g, '.')}@email.com`,
        bloodGroup: ['A+', 'O+', 'B+', 'AB+', 'O-'][map.size % 5],
        lastVisit: a.date,
        visits: 1,
      })
    } else {
      map.get(a.patient).visits += 1
    }
  })
  return [...map.values()]
}
export const getPatients = () => {
  let list = read(KEYS.patients, null)
  if (!list) list = write(KEYS.patients, seedPatients())
  return list
}
export const savePatients = (list) => write(KEYS.patients, list)
export const updatePatient = (id, patch) =>
  savePatients(getPatients().map((p) => (p.id === id ? { ...p, ...patch } : p)))
export const deletePatient = (id) => savePatients(getPatients().filter((p) => p.id !== id))

/* ============================================================
   THEME  (admin controls the customer website colors)
   ============================================================ */
export const DEFAULT_THEME = {
  brand: '#4f6cf7',
  violet: '#7b5cff',
  accent: '#10c8a3',
  bg: '#ffffff',
  bgSoft: '#f5f8ff',
  surface: '#ffffff',
  text: '#0c1424',
}
export const PRESETS = {
  Ocean:   { brand: '#4f6cf7', violet: '#7b5cff', accent: '#10c8a3', bgSoft: '#f5f8ff' },
  Emerald: { brand: '#10b981', violet: '#0ea5e9', accent: '#f59e0b', bgSoft: '#f1fbf6' },
  Sunset:  { brand: '#f97316', violet: '#ef4444', accent: '#8b5cf6', bgSoft: '#fff7f1' },
  Rose:    { brand: '#ec4899', violet: '#8b5cf6', accent: '#f43f5e', bgSoft: '#fff5fa' },
  Slate:   { brand: '#475569', violet: '#0f766e', accent: '#0ea5e9', bgSoft: '#f4f6fb' },
}
export const getThemeColors = () => ({ ...DEFAULT_THEME, ...read(KEYS.themeColors, {}) })
export const saveThemeColors = (colors) => write(KEYS.themeColors, colors)
export const resetThemeColors = () => write(KEYS.themeColors, {})
/* Theme mode is stored as a RAW string (not JSON) to stay compatible
   with the customer site's existing localStorage('pulse-theme') usage. */
export const getThemeMode = () => (cache.has(KEYS.themeMode) ? cache.get(KEYS.themeMode) : localStorage.getItem(KEYS.themeMode)) || 'light'
export const setThemeMode = (mode) => {
  if (getThemeMode() === mode && cache.has(KEYS.themeMode)) return mode
  cache.set(KEYS.themeMode, mode)
  localStorage.setItem(KEYS.themeMode, mode)
  window.dispatchEvent(new CustomEvent('pulse:store', { detail: { key: KEYS.themeMode } }))
  api.sync(KEYS.themeMode, mode)
  return mode
}

/* Apply current theme colors to the customer website CSS variables. */
export function applyCustomerTheme() {
  const c = getThemeColors()
  const root = document.documentElement
  const map = {
    '--brand': c.brand,
    '--brand-600': shadeHex(c.brand, 20),
    '--brand-soft': hexA(c.brand, 0.12),
    '--violet': c.violet,
    '--accent': c.accent,
    '--accent-soft': hexA(c.accent, 0.14),
    '--bg-soft': c.bgSoft,
  }
  Object.entries(map).forEach(([k, v]) => v && root.style.setProperty(k, v))
}
function hexA(hex, a) {
  if (!hex?.startsWith('#') || hex.length < 7) return hex
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}
function shadeHex(hex, amt) {
  if (!hex?.startsWith('#') || hex.length < 7) return hex
  const n = parseInt(hex.slice(1), 16)
  const c = (v) => Math.max(0, Math.min(255, v))
  const r = c((n >> 16) - amt), g = c(((n >> 8) & 255) - amt), b = c((n & 255) - amt)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

/* ============================================================
   WEBSITE CONTENT  (homepage editable text)
   ============================================================ */
export const DEFAULT_CONTENT = {
  heroTitleA: 'Your health,',
  heroTitleB: 'expertly cared for.',
  heroSub: 'Book appointments with top specialists in seconds. World-class doctors, modern facilities, and compassionate care — all designed around you.',
  servicesTitle: 'Complete care across every department',
  servicesSub: "From routine check-ups to specialist treatment, our expert teams cover the full spectrum of your family's health needs.",
  ctaTitle: 'Ready to take care of your health?',
  ctaSub: 'Join thousands of patients who trust Pulse for fast, friendly and expert medical care. Book your first appointment today.',
  phone: '+1 (415) 555-0100',
  email: 'care@pulseclinic.com',
  address: '24 Harbor St, San Francisco',
  footer: '© 2026 Pulse Clinic. All rights reserved.',
  testimonials: SEED_TESTIMONIALS,
}
export const getContent = () => ({ ...DEFAULT_CONTENT, ...read(KEYS.content, {}) })
export const saveContent = (patch) => write(KEYS.content, { ...getContent(), ...patch })
export const resetContent = () => write(KEYS.content, {})

/* ============================================================
   NOTIFICATIONS
   ============================================================ */
const seedNotifications = () => SEED_NOTIFICATIONS.map((n) => ({ ...n }))
export const getNotifications = () => {
  let list = read(KEYS.notifications, null)
  if (!list) list = write(KEYS.notifications, seedNotifications())
  return list
}
export const addNotification = (n) =>
  write(KEYS.notifications, [{ id: uid('n'), time: 'just now', read: false, ...n }, ...getNotifications()])
export const markNotificationRead = (id) =>
  write(KEYS.notifications, getNotifications().map((n) => (n.id === id ? { ...n, read: true } : n)))
export const markAllNotificationsRead = () =>
  write(KEYS.notifications, getNotifications().map((n) => ({ ...n, read: true })))

/* ============================================================
   BOOKINGS (customer-created) — read for admin patient/appt views
   ============================================================ */
export const getBookings = () => read(KEYS.bookings, [])
export const addBooking = (record) => {
  const b = { id: uid('bk'), status: 'Booked', createdAt: new Date().toISOString(), ...record }
  write(KEYS.bookings, [b, ...getBookings()])
  return b
}
export const setBookingStatus = (id, status) =>
  write(KEYS.bookings, getBookings().map((b) => (b.id === id ? { ...b, status } : b)))
export const updateBooking = (id, patch) =>
  write(KEYS.bookings, getBookings().map((b) => (b.id === id ? { ...b, ...patch } : b)))

/* Reset everything (handy for demos) */
export const resetAll = () => Object.values(KEYS).forEach((k) => { cache.delete(k); localStorage.removeItem(k) })
