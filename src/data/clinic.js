/* ============================================================
   Pulse — Sample / dummy clinic data
   Swap with a real API later; shapes are intentionally flat.
   ============================================================ */

export const DEPARTMENTS = {
  Cardiology:  { color: '#4f6cf7' },
  Pediatrics:  { color: '#12c2a0' },
  Dermatology: { color: '#f59e0b' },
  Orthopedics: { color: '#f43f5e' },
  Neurology:   { color: '#7b5cff' },
  Dentistry:   { color: '#0ea5e9' },
}

export const STATUS_META = {
  available:    { label: 'Available',    badge: 'green' },
  busy:         { label: 'With patient', badge: 'amber' },
  'in-surgery': { label: 'In surgery',   badge: 'red' },
  'on-leave':   { label: 'On leave',     badge: 'gray' },
}

export const APPT_STATUS = {
  confirmed: { label: 'Confirmed', badge: 'blue' },
  completed: { label: 'Completed', badge: 'green' },
  pending:   { label: 'Pending',   badge: 'amber' },
  cancelled: { label: 'Cancelled', badge: 'red' },
}

export const TYPE_META = {
  Consultation: '#4f6cf7',
  'Follow-up':  '#12c2a0',
  'Check-up':   '#f59e0b',
  Procedure:    '#f43f5e',
  Emergency:    '#7b5cff',
}

export const DOCTORS = [
  { id: 'd1', name: 'Dr. Sarah Chen', specialty: 'Cardiology', title: 'Senior Cardiologist', color: '#4f6cf7',
    rating: 4.9, reviews: 312, experience: 14, patients: 1840, status: 'available', room: 'B-204', fee: 180,
    phone: '+1 (415) 555-0148', email: 's.chen@pulseclinic.com', languages: ['English', 'Mandarin'],
    days: 'Mon–Fri', shift: '09:00 – 17:00',
    bio: 'Board-certified cardiologist specializing in preventive cardiology and non-invasive imaging. Leads the clinic’s heart-health screening program.' },
  { id: 'd2', name: 'Dr. Marcus Reyes', specialty: 'Orthopedics', title: 'Orthopedic Surgeon', color: '#f43f5e',
    rating: 4.7, reviews: 208, experience: 11, patients: 1320, status: 'in-surgery', room: 'OR-1', fee: 220,
    phone: '+1 (415) 555-0192', email: 'm.reyes@pulseclinic.com', languages: ['English', 'Spanish'],
    days: 'Mon–Thu', shift: '08:00 – 16:00',
    bio: 'Sports-medicine focused surgeon with a sub-specialty in arthroscopic knee and shoulder reconstruction.' },
  { id: 'd3', name: 'Dr. Amara Okafor', specialty: 'Pediatrics', title: 'Consultant Pediatrician', color: '#12c2a0',
    rating: 5.0, reviews: 421, experience: 9, patients: 2110, status: 'available', room: 'A-110', fee: 140,
    phone: '+1 (415) 555-0173', email: 'a.okafor@pulseclinic.com', languages: ['English', 'French'],
    days: 'Tue–Sat', shift: '10:00 – 18:00',
    bio: 'Passionate about early childhood development and family-centred care. Runs weekly newborn wellness clinics.' },
  { id: 'd4', name: 'Dr. Daniel Weiss', specialty: 'Neurology', title: 'Neurologist', color: '#7b5cff',
    rating: 4.8, reviews: 176, experience: 16, patients: 980, status: 'on-leave', room: 'C-301', fee: 240,
    phone: '+1 (415) 555-0110', email: 'd.weiss@pulseclinic.com', languages: ['English', 'German'],
    days: 'Mon–Wed', shift: '09:00 – 15:00',
    bio: 'Specialist in headache disorders and epilepsy management with a research background in neuro-imaging.' },
  { id: 'd5', name: 'Dr. Priya Nair', specialty: 'Dermatology', title: 'Dermatologist', color: '#f59e0b',
    rating: 4.9, reviews: 354, experience: 8, patients: 1670, status: 'available', room: 'A-205', fee: 160,
    phone: '+1 (415) 555-0166', email: 'p.nair@pulseclinic.com', languages: ['English', 'Hindi'],
    days: 'Wed–Sun', shift: '11:00 – 19:00',
    bio: 'Cosmetic and medical dermatology, with special interest in laser therapy and chronic skin conditions.' },
  { id: 'd6', name: 'Dr. James O’Brien', specialty: 'Dentistry', title: 'Dental Surgeon', color: '#0ea5e9',
    rating: 4.6, reviews: 142, experience: 12, patients: 1450, status: 'busy', room: 'D-102', fee: 130,
    phone: '+1 (415) 555-0185', email: 'j.obrien@pulseclinic.com', languages: ['English'],
    days: 'Mon–Fri', shift: '08:30 – 16:30',
    bio: 'Restorative and cosmetic dentistry, including implants and same-day crowns.' },
  { id: 'd7', name: 'Dr. Lena Petrova', specialty: 'Cardiology', title: 'Interventional Cardiologist', color: '#3f57d6',
    rating: 4.8, reviews: 197, experience: 13, patients: 1210, status: 'available', room: 'B-208', fee: 200,
    phone: '+1 (415) 555-0121', email: 'l.petrova@pulseclinic.com', languages: ['English', 'Russian'],
    days: 'Thu–Mon', shift: '07:00 – 15:00',
    bio: 'Performs angioplasty and stent procedures; co-leads the chest-pain rapid assessment unit.' },
  { id: 'd8', name: 'Dr. Hassan Ali', specialty: 'Pediatrics', title: 'Pediatric Specialist', color: '#0a9e7e',
    rating: 4.7, reviews: 263, experience: 10, patients: 1990, status: 'available', room: 'A-112', fee: 145,
    phone: '+1 (415) 555-0139', email: 'h.ali@pulseclinic.com', languages: ['English', 'Arabic'],
    days: 'Sun–Thu', shift: '09:00 – 17:00',
    bio: 'Focus on pediatric respiratory health and asthma management programmes for school-age children.' },
]

export const APPOINTMENTS = [
  { id: 'a1',  patient: 'Olivia Bennett',  age: 34, doctorId: 'd1', date: '2026-06-29', time: '09:00', type: 'Consultation', status: 'confirmed', reason: 'Chest tightness on exertion' },
  { id: 'a2',  patient: 'Liam Carter',     age: 8,  doctorId: 'd3', date: '2026-06-29', time: '09:30', type: 'Check-up',     status: 'completed', reason: 'Routine wellness visit' },
  { id: 'a3',  patient: 'Sophia Martinez', age: 29, doctorId: 'd5', date: '2026-06-29', time: '10:15', type: 'Consultation', status: 'confirmed', reason: 'Persistent eczema flare-up' },
  { id: 'a4',  patient: 'Noah Williams',   age: 52, doctorId: 'd2', date: '2026-06-29', time: '11:00', type: 'Procedure',    status: 'pending',   reason: 'Knee arthroscopy review' },
  { id: 'a5',  patient: 'Emma Thompson',   age: 41, doctorId: 'd7', date: '2026-06-29', time: '11:45', type: 'Follow-up',    status: 'confirmed', reason: 'Post-stent 3-month check' },
  { id: 'a6',  patient: 'James Anderson',  age: 63, doctorId: 'd4', date: '2026-06-29', time: '13:00', type: 'Consultation', status: 'cancelled', reason: 'Recurring migraines' },
  { id: 'a7',  patient: 'Ava Rodriguez',   age: 5,  doctorId: 'd8', date: '2026-06-29', time: '13:30', type: 'Check-up',     status: 'confirmed', reason: 'Asthma management plan' },
  { id: 'a8',  patient: 'William Davis',   age: 47, doctorId: 'd6', date: '2026-06-29', time: '14:15', type: 'Procedure',    status: 'completed', reason: 'Dental implant fitting' },
  { id: 'a9',  patient: 'Isabella Garcia', age: 38, doctorId: 'd1', date: '2026-06-29', time: '15:00', type: 'Follow-up',    status: 'confirmed', reason: 'Blood pressure review' },
  { id: 'a10', patient: 'Benjamin Lee',    age: 26, doctorId: 'd5', date: '2026-06-29', time: '15:45', type: 'Consultation', status: 'pending',   reason: 'Acne treatment options' },
  { id: 'a11', patient: 'Mia Wilson',      age: 31, doctorId: 'd3', date: '2026-06-30', time: '09:15', type: 'Consultation', status: 'confirmed', reason: 'Toddler fever & rash' },
  { id: 'a12', patient: 'Lucas Brown',     age: 58, doctorId: 'd2', date: '2026-06-30', time: '10:00', type: 'Emergency',    status: 'confirmed', reason: 'Acute shoulder dislocation' },
  { id: 'a13', patient: 'Charlotte Moore', age: 44, doctorId: 'd7', date: '2026-06-30', time: '10:45', type: 'Consultation', status: 'pending',   reason: 'Palpitations assessment' },
  { id: 'a14', patient: 'Henry Taylor',    age: 70, doctorId: 'd4', date: '2026-06-30', time: '11:30', type: 'Follow-up',    status: 'confirmed', reason: 'Epilepsy medication review' },
  { id: 'a15', patient: 'Amelia Jackson',  age: 22, doctorId: 'd6', date: '2026-06-30', time: '14:00', type: 'Check-up',     status: 'confirmed', reason: 'Six-month dental cleaning' },
  { id: 'a16', patient: 'Daniel White',    age: 36, doctorId: 'd1', date: '2026-07-01', time: '09:30', type: 'Consultation', status: 'pending',   reason: 'Cholesterol follow-up' },
  { id: 'a17', patient: 'Grace Harris',    age: 49, doctorId: 'd5', date: '2026-07-01', time: '12:00', type: 'Procedure',    status: 'confirmed', reason: 'Mole removal' },
  { id: 'a18', patient: 'Jack Robinson',   age: 14, doctorId: 'd8', date: '2026-07-01', time: '13:45', type: 'Follow-up',    status: 'confirmed', reason: 'Allergy test results' },
]

export const WEEKLY = [
  { day: 'Mon', appointments: 42, completed: 38 },
  { day: 'Tue', appointments: 38, completed: 35 },
  { day: 'Wed', appointments: 51, completed: 47 },
  { day: 'Thu', appointments: 47, completed: 44 },
  { day: 'Fri', appointments: 55, completed: 50 },
  { day: 'Sat', appointments: 33, completed: 31 },
  { day: 'Sun', appointments: 19, completed: 18 },
]

/* ---- Customer-facing content ---- */

export const SERVICES = [
  { id: 'Cardiology',  icon: 'HeartPulse',  desc: 'Comprehensive heart care, screening & preventive cardiology.' },
  { id: 'Pediatrics',  icon: 'Baby',        desc: 'Gentle, expert care for newborns, children & teens.' },
  { id: 'Dermatology', icon: 'Sparkles',    desc: 'Medical & cosmetic skin treatments with proven results.' },
  { id: 'Orthopedics', icon: 'Bone',        desc: 'Joint, bone & sports-injury care from leading surgeons.' },
  { id: 'Neurology',   icon: 'Brain',       desc: 'Advanced diagnosis & treatment for neurological conditions.' },
  { id: 'Dentistry',   icon: 'Smile',       desc: 'Modern restorative & cosmetic dentistry for the whole family.' },
]

export const STATS = [
  { value: 45, suffix: '+', label: 'Expert doctors' },
  { value: 38, suffix: 'k', label: 'Happy patients' },
  { value: 25, suffix: '+', label: 'Years of care' },
  { value: 99, suffix: '%', label: 'Satisfaction rate' },
]

export const STEPS = [
  { icon: 'Search',       title: 'Find your doctor', desc: 'Browse specialists by department and read verified patient reviews.' },
  { icon: 'CalendarCheck',title: 'Book a slot',      desc: 'Pick a time that suits you and confirm in seconds — no phone calls.' },
  { icon: 'Stethoscope',  title: 'Get care',         desc: 'Visit the clinic or connect online and receive expert treatment.' },
]

export const FEATURES = [
  { icon: 'ShieldCheck', title: 'Certified specialists', desc: 'Every doctor is board-certified and vetted by our medical board.' },
  { icon: 'Clock',       title: '24/7 availability',     desc: 'Round-the-clock support and emergency care whenever you need it.' },
  { icon: 'Video',       title: 'Online consultations',  desc: 'Talk to a doctor from home with secure video appointments.' },
  { icon: 'HeartHandshake', title: 'Patient-first care', desc: 'Personalised treatment plans built around you and your family.' },
]

export const TESTIMONIALS = [
  { name: 'Rebecca Lawson', role: 'Patient · Cardiology', rating: 5, color: '#4f6cf7',
    text: 'Booking was effortless and Dr. Chen was incredibly thorough. I felt genuinely cared for from the moment I walked in.' },
  { name: 'Michael Tran', role: 'Patient · Orthopedics', rating: 5, color: '#f43f5e',
    text: 'After my knee surgery the whole team kept me informed every step. The follow-up care was outstanding.' },
  { name: 'Aisha Rahman', role: 'Parent · Pediatrics', rating: 5, color: '#12c2a0',
    text: 'Dr. Okafor is amazing with my kids. The clinic is spotless, modern and the staff are so warm and friendly.' },
  { name: 'David Mitchell', role: 'Patient · Dermatology', rating: 5, color: '#f59e0b',
    text: 'Finally found a clinic that takes skin health seriously. Clear advice, real results, zero waiting around.' },
]

/* Admin notification seed (fixed ids so the server seed matches the front-end). */
export const NOTIFICATIONS = [
  { id: 'n1', type: 'booking', title: 'New booking received', body: 'Olivia Bennett booked Cardiology for today 09:00.', time: '5m ago', read: false },
  { id: 'n2', type: 'cancel', title: 'Appointment cancelled', body: 'James Anderson cancelled his Neurology visit.', time: '40m ago', read: false },
  { id: 'n3', type: 'leave', title: 'Doctor on leave', body: 'Dr. Daniel Weiss is on leave today.', time: '2h ago', read: false },
  { id: 'n4', type: 'system', title: 'Theme updated', body: 'Website theme was changed to “Ocean”.', time: '1d ago', read: true },
]
