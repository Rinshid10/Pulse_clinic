/* Doctor domain service — delegates to the shared clinic store.
   Swap these bodies for API calls later; signatures stay the same. */
import * as store from '../../services/clinicStore'

export const listDoctors = () => store.getDoctors()
export const getDoctor = (id) => store.getDoctor(id)
export const createDoctor = (data) => store.addDoctor(data)
export const editDoctor = (id, patch) => store.updateDoctor(id, patch)
export const removeDoctor = (id) => store.deleteDoctor(id)
export const toggleActive = (id, active) => store.setDoctorActive(id, active)
export const setAvailability = (id, availability) => store.updateDoctor(id, { availability })

/* Today leave */
export const getLeave = (id) => store.getLeave(id)
export const setLeave = (id, leave) => store.setLeave(id, leave)
export const clearLeave = (id) => store.setLeave(id, null)
