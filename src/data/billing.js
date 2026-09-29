/* Seed data for the billing desk and pharmacy desk (also used by server/seed.js). */

export const BILLS = [
  { id: 'b1', no: 'PC-0001', patient: { name: 'Olivia Bennett', age: 34, gender: 'Female', phone: '+1 (415) 555-0301' }, doctorId: 'd1', type: 'consultation', items: [{ label: 'Consultation fee', amount: 180 }], discount: 0, total: 180, method: 'Card', date: '2026-06-22', time: '09:20', createdBy: 'Sofia Reyes' },
  { id: 'b2', no: 'PC-0002', patient: { name: 'Lucas Brown', age: 58, gender: 'Male', phone: '+1 (415) 555-0302' }, doctorId: 'd2', type: 'consultation', items: [{ label: 'Consultation fee', amount: 200 }, { label: 'X-ray (shoulder)', amount: 90 }], discount: 0, total: 290, method: 'Insurance', date: '2026-06-24', time: '10:05', createdBy: 'Sofia Reyes' },
  { id: 'b3', no: 'PC-0003', patient: { name: 'Mia Wilson', age: 31, gender: 'Female', phone: '+1 (415) 555-0303' }, doctorId: 'd3', type: 'consultation', items: [{ label: 'Consultation fee', amount: 140 }], discount: 10, total: 130, method: 'Cash', date: '2026-06-25', time: '11:40', createdBy: 'Amelia Hart' },
  { id: 'b4', no: 'PC-0004', patient: { name: 'Olivia Bennett', age: 34, gender: 'Female', phone: '+1 (415) 555-0301' }, doctorId: 'd1', type: 'follow-up', followUpOf: 'b1', items: [{ label: 'Follow-up visit (free within 7 days)', amount: 0 }], discount: 0, total: 0, method: 'Cash', date: '2026-06-27', time: '09:00', createdBy: 'Sofia Reyes' },
  { id: 'b5', no: 'PC-0005', patient: { name: 'Henry Taylor', age: 70, gender: 'Male', phone: '+1 (415) 555-0304' }, doctorId: 'd4', type: 'consultation', items: [{ label: 'Consultation fee', amount: 220 }, { label: 'EEG', amount: 150 }], discount: 0, total: 370, method: 'Card', date: '2026-06-29', time: '08:45', createdBy: 'Sofia Reyes' },
  { id: 'b6', no: 'PC-0006', patient: { name: 'Sophia Martinez', age: 29, gender: 'Female', phone: '+1 (415) 555-0305' }, doctorId: 'd5', type: 'consultation', items: [{ label: 'Consultation fee', amount: 160 }], discount: 0, total: 160, method: 'UPI', date: '2026-06-29', time: '10:10', createdBy: 'Sofia Reyes' },
  { id: 'b7', no: 'PC-0007', patient: { name: 'Ava Rodriguez', age: 5, gender: 'Female', phone: '+1 (415) 555-0306' }, doctorId: 'd8', type: 'consultation', items: [{ label: 'Consultation fee', amount: 120 }, { label: 'Nebulisation', amount: 40 }], discount: 0, total: 160, method: 'Cash', date: '2026-06-29', time: '13:35', createdBy: 'Amelia Hart' },
]

export const MEDICINES = [
  { id: 'm1', name: 'Paracetamol 500mg', category: 'Tablet', unit: 'strip of 10', price: 2.5, stock: 140 },
  { id: 'm2', name: 'Ibuprofen 400mg', category: 'Tablet', unit: 'strip of 10', price: 3.2, stock: 85 },
  { id: 'm3', name: 'Amoxicillin 500mg', category: 'Capsule', unit: 'strip of 10', price: 6.8, stock: 60 },
  { id: 'm4', name: 'Azithromycin 250mg', category: 'Tablet', unit: 'strip of 6', price: 7.5, stock: 14 },
  { id: 'm5', name: 'Cetirizine 10mg', category: 'Tablet', unit: 'strip of 10', price: 1.9, stock: 200 },
  { id: 'm6', name: 'Omeprazole 20mg', category: 'Capsule', unit: 'strip of 14', price: 4.4, stock: 72 },
  { id: 'm7', name: 'Cough syrup (Dextromethorphan)', category: 'Syrup', unit: '100 ml bottle', price: 5.5, stock: 38 },
  { id: 'm8', name: 'ORS sachet', category: 'Other', unit: 'sachet', price: 0.6, stock: 300 },
  { id: 'm9', name: 'Salbutamol inhaler', category: 'Inhaler', unit: '200 doses', price: 12.0, stock: 18 },
  { id: 'm10', name: 'Metformin 500mg', category: 'Tablet', unit: 'strip of 10', price: 2.8, stock: 120 },
  { id: 'm11', name: 'Amlodipine 5mg', category: 'Tablet', unit: 'strip of 10', price: 3.0, stock: 95 },
  { id: 'm12', name: 'Atorvastatin 10mg', category: 'Tablet', unit: 'strip of 10', price: 4.9, stock: 64 },
  { id: 'm13', name: 'Hydrocortisone 1% cream', category: 'Ointment', unit: '15 g tube', price: 3.7, stock: 41 },
  { id: 'm14', name: 'Eye drops (Carboxymethylcellulose)', category: 'Drops', unit: '10 ml', price: 4.2, stock: 9 },
  { id: 'm15', name: 'Vitamin D3 60k IU', category: 'Capsule', unit: 'strip of 4', price: 3.9, stock: 110 },
  { id: 'm16', name: 'Insulin glargine', category: 'Injection', unit: '3 ml pen', price: 28.0, stock: 12 },
]

export const PHARMACY_BILLS = [
  { id: 'p1', no: 'PH-0001', customer: { name: 'Olivia Bennett', phone: '+1 (415) 555-0301', age: 34 }, doctorId: 'd1', items: [{ medicineId: 'm11', name: 'Amlodipine 5mg', qty: 2, price: 3.0, total: 6.0 }, { medicineId: 'm12', name: 'Atorvastatin 10mg', qty: 1, price: 4.9, total: 4.9 }], subtotal: 10.9, discount: 0, total: 10.9, method: 'Card', date: '2026-06-22', time: '09:48', createdBy: 'Aisha Khan' },
  { id: 'p2', no: 'PH-0002', customer: { name: 'Mia Wilson', phone: '+1 (415) 555-0303', age: 31 }, doctorId: 'd3', items: [{ medicineId: 'm1', name: 'Paracetamol 500mg', qty: 1, price: 2.5, total: 2.5 }, { medicineId: 'm5', name: 'Cetirizine 10mg', qty: 1, price: 1.9, total: 1.9 }, { medicineId: 'm7', name: 'Cough syrup (Dextromethorphan)', qty: 1, price: 5.5, total: 5.5 }], subtotal: 9.9, discount: 0, total: 9.9, method: 'Cash', date: '2026-06-25', time: '12:02', createdBy: 'Aisha Khan' },
  { id: 'p3', no: 'PH-0003', customer: { name: 'Olivia Bennett', phone: '+1 (415) 555-0301', age: 34 }, doctorId: 'd1', items: [{ medicineId: 'm11', name: 'Amlodipine 5mg', qty: 3, price: 3.0, total: 9.0 }], subtotal: 9.0, discount: 0, total: 9.0, method: 'Cash', date: '2026-06-27', time: '09:31', createdBy: 'Aisha Khan' },
  { id: 'p4', no: 'PH-0004', customer: { name: 'Henry Taylor', phone: '+1 (415) 555-0304', age: 70 }, doctorId: 'd4', items: [{ medicineId: 'm6', name: 'Omeprazole 20mg', qty: 1, price: 4.4, total: 4.4 }, { medicineId: 'm15', name: 'Vitamin D3 60k IU', qty: 2, price: 3.9, total: 7.8 }], subtotal: 12.2, discount: 0.2, total: 12.0, method: 'UPI', date: '2026-06-29', time: '09:15', createdBy: 'Aisha Khan' },
  { id: 'p5', no: 'PH-0005', customer: { name: 'Ava Rodriguez', phone: '+1 (415) 555-0306', age: 5 }, doctorId: 'd8', items: [{ medicineId: 'm9', name: 'Salbutamol inhaler', qty: 1, price: 12.0, total: 12.0 }, { medicineId: 'm8', name: 'ORS sachet', qty: 6, price: 0.6, total: 3.6 }], subtotal: 15.6, discount: 0, total: 15.6, method: 'Cash', date: '2026-06-29', time: '13:50', createdBy: 'Aisha Khan' },
]

export const MEDICINE_REQUESTS = [
  { id: 'mr1', kind: 'restock', medicineId: 'm4', name: 'Azithromycin 250mg', qty: 40, reason: 'Only 14 strips left, high demand this week', status: 'pending', by: 'Aisha Khan', date: '2026-06-28' },
  { id: 'mr2', kind: 'new', name: 'Loratadine 10mg', category: 'Tablet', unit: 'strip of 10', qty: 50, price: 2.2, reason: 'Patients keep asking for a non-drowsy antihistamine', status: 'pending', by: 'Aisha Khan', date: '2026-06-27' },
  { id: 'mr3', kind: 'restock', medicineId: 'm8', name: 'ORS sachet', qty: 200, reason: 'Summer stock-up', status: 'approved', by: 'Aisha Khan', date: '2026-06-20', decidedBy: 'Amelia Hart', decidedAt: '2026-06-21', note: 'Ordered from supplier' },
]
