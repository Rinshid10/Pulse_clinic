import * as store from '../../services/clinicStore'

export const listAppointments = () => store.getAppointments()
export const updateAppointment = (id, patch) => store.updateAppointment(id, patch)
export const confirm = (id) => store.setAppointmentStatus(id, 'confirmed')
export const cancel = (id) => store.setAppointmentStatus(id, 'cancelled')
export const complete = (id) => store.setAppointmentStatus(id, 'completed')
export const reschedule = (id, date, time) => store.updateAppointment(id, { date, time, status: 'confirmed' })
