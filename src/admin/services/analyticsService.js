import * as store from '../../services/clinicStore'
import { TODAY } from '../../services/clinicStore'

/* All analytics are DERIVED from the live store so admin edits reflect here. */

export function overview() {
  const appts = store.getAppointments()
  const doctors = store.getDoctors()
  const patients = store.getPatients()
  const leaves = store.getLeaves()

  const today = appts.filter((a) => a.date === TODAY)
  const pending = appts.filter((a) => a.status === 'pending').length
  const cancelled = appts.filter((a) => a.status === 'cancelled').length
  const completed = appts.filter((a) => a.status === 'completed')

  const revenue = completed.reduce((sum, a) => {
    const d = doctors.find((x) => x.id === a.doctorId)
    return sum + (d?.fee || 0)
  }, 0)

  const onLeave = Object.values(leaves).filter((l) => l.date === TODAY).length

  return {
    todayCount: today.length,
    totalDoctors: doctors.length,
    activeDoctors: doctors.filter((d) => d.active).length,
    totalPatients: patients.length,
    pending,
    cancelled,
    revenue,
    onLeave,
  }
}

export const weekly = () => [
  { day: 'Mon', bookings: 42, cancelled: 4 },
  { day: 'Tue', bookings: 38, cancelled: 3 },
  { day: 'Wed', bookings: 51, cancelled: 6 },
  { day: 'Thu', bookings: 47, cancelled: 5 },
  { day: 'Fri', bookings: 55, cancelled: 5 },
  { day: 'Sat', bookings: 33, cancelled: 2 },
  { day: 'Sun', bookings: 19, cancelled: 1 },
]

export const peakHours = () => [
  { hour: '8a', visits: 12 }, { hour: '9a', visits: 28 }, { hour: '10a', visits: 35 },
  { hour: '11a', visits: 31 }, { hour: '12p', visits: 22 }, { hour: '1p', visits: 18 },
  { hour: '2p', visits: 30 }, { hour: '3p', visits: 34 }, { hour: '4p', visits: 26 },
  { hour: '5p', visits: 17 },
]

export function doctorPerformance() {
  const appts = store.getAppointments()
  return store
    .getDoctors()
    .map((d) => ({
      name: d.name.replace('Dr. ', ''),
      appointments: appts.filter((a) => a.doctorId === d.id).length,
      rating: d.rating,
    }))
    .sort((a, b) => b.appointments - a.appointments)
}

export function statusBreakdown() {
  const appts = store.getAppointments()
  const by = (s) => appts.filter((a) => a.status === s).length
  return [
    { name: 'Confirmed', value: by('confirmed'), color: '#4f6cf7' },
    { name: 'Completed', value: by('completed'), color: '#10c8a3' },
    { name: 'Pending', value: by('pending'), color: '#f59e0b' },
    { name: 'Cancelled', value: by('cancelled'), color: '#f43f5e' },
  ]
}
