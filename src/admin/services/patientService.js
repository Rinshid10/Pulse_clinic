import * as store from '../../services/clinicStore'

export const listPatients = () => store.getPatients()
export const editPatient = (id, patch) => store.updatePatient(id, patch)
export const removePatient = (id) => store.deletePatient(id)

/* Visit history for a patient = their appointments + customer bookings */
export const visitHistory = (name) => {
  const appts = store.getAppointments().filter((a) => a.patient === name)
  const bookings = store.getBookings().filter((b) => b.name === name)
  return [
    ...appts.map((a) => ({ date: a.date, time: a.time, type: a.type, status: a.status, doctorId: a.doctorId, reason: a.reason })),
    ...bookings.map((b) => ({ date: b.date, time: b.time, type: b.type, status: (b.status || 'Booked').toLowerCase(), doctorId: b.doctorId, reason: b.reason })),
  ].sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))
}
