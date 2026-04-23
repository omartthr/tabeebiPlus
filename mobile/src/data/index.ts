export interface Specialty {
  id: string;
  name: string;
  sub: string;
  icon: string;
  tint: string;
  accent: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  price: number;
  today: boolean;
  exp: string;
  loc: string;
  initials: string;
  hue: number;
}

export interface Appointment {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  status: string;
  clinic?: string;
  initials: string;
  hue: number;
  price?: number;
}

export interface Result {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  title: string;
  diagnosis: string;
  notes: string;
  meds: string[];
  next: string;
  unread: boolean;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
}

export interface Ticket {
  id: string;
  subject: string;
  status: string;
  time: string;
  last: string;
}

export interface TimeSlot {
  t: string;
  state: 'available' | 'unavailable';
}

export interface Day {
  day: string;
  num: number;
  month: string;
  full: string;
}

export const SPECIALTIES: Specialty[] = [
  { id: 'obgyn', name: 'OB-GYN', sub: '3 doctors (Demo)', icon: 'user-round', tint: '#f5e1ec', accent: '#8a2a64' },
  { id: 'derm', name: 'Dermatology', sub: '3 doctors (Demo)', icon: 'layers', tint: '#fbefe2', accent: '#a5622b' },
  { id: 'pulmo', name: 'Pulmonary', sub: '3 doctors (Demo)', icon: 'wind', tint: '#e3edf0', accent: '#3d6a78' },
  { id: 'dental', name: 'Dental', sub: '3 doctors (Demo)', icon: 'tooth', tint: '#eaf5f5', accent: '#0d7377' },
  { id: 'eye', name: 'Eye Care', sub: '3 doctors (Demo)', icon: 'eye', tint: '#fdf6e6', accent: '#b37d1f' },
  { id: 'cardio', name: 'Cardiology', sub: '3 doctors (Demo)', icon: 'heart', tint: '#fadfdc', accent: '#912a23' },
  { id: 'neuro', name: 'Neurology', sub: '3 doctors (Demo)', icon: 'brain', tint: '#ede7f5', accent: '#5b3b9f' },
  { id: 'ortho', name: 'Orthopedic', sub: '3 doctors (Demo)', icon: 'bone', tint: '#eaf1f5', accent: '#2c5a85' },
  { id: 'general', name: 'General', sub: '3 doctors (Demo)', icon: 'stethoscope', tint: '#d4ecec', accent: '#0a5d60' },
  { id: 'pediatric', name: 'Pediatric', sub: '3 doctors (Demo)', icon: 'baby', tint: '#fbe6d1', accent: '#8f4a0d' },
];

export const DOCTORS: Doctor[] = [
  { id: 'd1', name: 'Dr. Layla (Prototip)', specialty: 'Dental · Orthodontist', rating: 4.9, reviews: 412, price: 35000, today: true, exp: '12 yrs', loc: 'Al-Mansour Clinic, Baghdad', initials: 'LJ', hue: 175 },
  { id: 'd2', name: 'Dr. Omar (Prototip)', specialty: 'Dental · Oral Surgery', rating: 4.8, reviews: 287, price: 50000, today: true, exp: '9 yrs', loc: 'Tabeebi Clinic, Karrada', initials: 'OK', hue: 190 },
  { id: 'd3', name: 'Dr. Ruqaya (Prototip)', specialty: 'Dental · Pediatric Dent.', rating: 4.7, reviews: 198, price: 25000, today: false, exp: '7 yrs', loc: 'Al-Waha Health Center', initials: 'RH', hue: 40 },
];

export const APPOINTMENTS_UPCOMING: Appointment[] = [
  {
    id: 'a1', doctor: 'Dr. Layla (Prototip)', specialty: 'Dental · Orthodontist',
    date: 'Tomorrow', time: '10:30 AM', status: 'confirmed', clinic: 'Al-Mansour Clinic',
    initials: 'LJ', hue: 175, price: 35000,
  },
  {
    id: 'a2', doctor: 'Dr. Omar (Prototip)', specialty: 'Dental · Oral Surgery',
    date: 'Apr 28', time: '3:00 PM', status: 'pending', clinic: 'Zayouna Private',
    initials: 'OK', hue: 190, price: 60000,
  },
];

export const APPOINTMENTS_PAST: Appointment[] = [
  { id: 'p1', doctor: 'Dr. Omar (Prototip)', specialty: 'Dental · Oral Surgery', date: 'Apr 11, 2026', time: '11:00 AM', status: 'completed', initials: 'OK', hue: 190 },
  { id: 'p3', doctor: 'Dr. Ruqaya (Prototip)', specialty: 'Dental · Pediatric Dent.', date: 'Feb 9, 2026', time: '9:15 AM', status: 'cancelled', initials: 'RH', hue: 40 },
];

export const RESULTS: Result[] = [
  {
    id: 'r1', doctor: 'Dr. Omar (Prototip)', specialty: 'Oral Surgery',
    date: 'Apr 11, 2026', title: 'Post-extraction check-up (Demo)',
    diagnosis: 'Healing progressing normally. Minor inflammation around socket — prescribed mouthwash.',
    notes: 'Wisdom tooth extraction site inspected at 2-week post-op. Socket closing well with no signs of dry socket or infection. Gum tissue healthy.',
    meds: ['Chlorhexidine 0.12%  ·  rinse 2×/day', 'Ibuprofen 400mg  ·  as needed'],
    next: 'Follow-up in 4 weeks. Resume normal brushing at extraction site.',
    unread: true,
  },
  {
    id: 'r3', doctor: 'Dr. Ruqaya (Prototip)', specialty: 'Dental',
    date: 'Jan 14, 2026', title: 'Routine cleaning & exam (Demo)',
    diagnosis: 'Good oral health overall. Minor gingivitis on lower right.',
    notes: 'Full scaling performed. Patient advised on flossing technique for posterior teeth.',
    meds: [],
    next: 'Next cleaning in 6 months.',
    unread: false,
  },
];

export const NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'reminder', title: 'Appointment tomorrow', body: 'Dr. Layla (Prototip) at 10:30 AM · Al-Mansour Clinic', time: '2h ago', unread: true },
  { id: 'n2', type: 'result', title: 'New result available', body: 'Dr. Omar (Prototip) uploaded your post-extraction report.', time: '5h ago', unread: true },
  { id: 'n3', type: 'confirm', title: 'Appointment confirmed', body: 'Dr. Omar (Prototip) · Apr 28 at 3:00 PM is confirmed.', time: 'Yesterday', unread: false },
  { id: 'n4', type: 'block', title: 'Late-cancel warning (Demo)', body: '2 more late cancels this month will temporarily block booking.', time: '2 days ago', unread: false },
  { id: 'n5', type: 'reminder', title: 'How was your visit?', body: 'Rate Dr. Omar (Prototip) from Apr 11.', time: '3 days ago', unread: false },
];

export const TICKETS: Ticket[] = [
  { id: 't1', subject: 'Cannot see my April result (Demo)', status: 'open', time: 'Opened 2h ago', last: 'Support: We are looking into this — reply within 4 hours.' },
  { id: 't2', subject: 'Refund for cancelled booking (Demo)', status: 'resolved', time: 'Resolved Apr 10', last: 'Refund of IQD 25,000 processed to your card.' },
];

export const TIME_SLOTS: TimeSlot[] = [
  { t: '9:00 AM', state: 'available' },
  { t: '9:30 AM', state: 'unavailable' },
  { t: '10:00 AM', state: 'unavailable' },
  { t: '10:30 AM', state: 'available' },
  { t: '11:00 AM', state: 'available' },
  { t: '11:30 AM', state: 'available' },
  { t: '1:00 PM', state: 'unavailable' },
  { t: '1:30 PM', state: 'available' },
  { t: '2:00 PM', state: 'available' },
  { t: '2:30 PM', state: 'unavailable' },
  { t: '3:00 PM', state: 'available' },
  { t: '3:30 PM', state: 'available' },
  { t: '4:00 PM', state: 'available' },
  { t: '4:30 PM', state: 'unavailable' },
];

export const DAYS: Day[] = [
  { day: 'Mon', num: 27, month: 'Apr', full: 'Mon Apr 27' },
  { day: 'Tue', num: 28, month: 'Apr', full: 'Tue Apr 28' },
  { day: 'Wed', num: 29, month: 'Apr', full: 'Wed Apr 29' },
  { day: 'Thu', num: 30, month: 'Apr', full: 'Thu Apr 30' },
  { day: 'Fri', num: 1, month: 'May', full: 'Fri May 1' },
  { day: 'Sat', num: 2, month: 'May', full: 'Sat May 2' },
  { day: 'Sun', num: 3, month: 'May', full: 'Sun May 3' },
];

export const iqd = (n: number) => new Intl.NumberFormat('en-US').format(n);
