import * as store from '../../services/clinicStore'

/* Website bookings (customer site) are shown next to clinic appointments.
   They keep their own record shape in the store; here they are mapped to the
   appointment shape and routed back to the bookings collection on update. */
const isBooking = (id) => String(id).startsWith('bk-')
const BOOKING_STATUS = { confirmed: 'Confirmed', cancelled: 'Cancelled', completed: 'Completed', pending: 'Booked', booked: 'Booked' }
const fromBooking = (b) => ({
  id: b.id, patient: b.name, age: b.age ?? null, phone: b.phone || '', doctorId: b.doctorId, date: b.date, time: b.time,
  type: b.type || 'Consultation', reason: b.reason || '', status: String(b.status || 'Booked').toLowerCase(), source: 'website',
})

export const listAppointments = () => [...store.getAppointments(), ...store.getBookings().map(fromBooking)]
export const updateAppointment = (id, patch) =>
  isBooking(id)
    ? store.updateBooking(id, { ...patch, ...(patch.status ? { status: BOOKING_STATUS[patch.status] || patch.status } : {}) })
    : store.updateAppointment(id, patch)
const setStatus = (id, status) => updateAppointment(id, { status })
export const confirm = (id) => setStatus(id, 'confirmed')
export const cancel = (id) => setStatus(id, 'cancelled')
export const complete = (id) => setStatus(id, 'completed')
export const reschedule = (id, date, time) => updateAppointment(id, { date, time, status: 'confirmed' })
