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
  { id: 'dental',    name: 'Dental',       sub: '48 doctors',  icon: 'tooth',        tint: '#eaf5f5', accent: '#0d7377' },
  { id: 'eye',       name: 'Eye Care',     sub: '22 doctors',  icon: 'eye',          tint: '#fdf6e6', accent: '#b37d1f' },
  { id: 'cardio',    name: 'Cardiology',   sub: '17 doctors',  icon: 'heart',        tint: '#fadfdc', accent: '#912a23' },
  { id: 'neuro',     name: 'Neurology',    sub: '12 doctors',  icon: 'brain',        tint: '#ede7f5', accent: '#5b3b9f' },
  { id: 'ortho',     name: 'Orthopedic',   sub: '29 doctors',  icon: 'bone',         tint: '#eaf1f5', accent: '#2c5a85' },
  { id: 'general',   name: 'General',      sub: '63 doctors',  icon: 'stethoscope',  tint: '#d4ecec', accent: '#0a5d60' },
  { id: 'pediatric', name: 'Pediatric',    sub: '31 doctors',  icon: 'baby',         tint: '#fbe6d1', accent: '#8f4a0d' },
  { id: 'obgyn',     name: 'OB-GYN',       sub: '19 doctors',  icon: 'user-round',   tint: '#f5e1ec', accent: '#8a2a64' },
  { id: 'derm',      name: 'Dermatology',  sub: '24 doctors',  icon: 'layers',       tint: '#fbefe2', accent: '#a5622b' },
  { id: 'pulmo',     name: 'Pulmonary',    sub: '9 doctors',   icon: 'wind',         tint: '#e3edf0', accent: '#3d6a78' },
];

export const DOCTORS: Doctor[] = [
  { id: 'd1', name: 'Dr. Layla Al-Jabari',   specialty: 'Dental · Orthodontist',    rating: 4.9, reviews: 412, price: 35000, today: true,  exp: '12 yrs', loc: 'Al-Mansour Clinic, Baghdad', initials: 'LJ', hue: 175 },
  { id: 'd2', name: 'Dr. Omar Al-Khafaji',   specialty: 'Dental · Oral Surgery',    rating: 4.8, reviews: 287, price: 50000, today: true,  exp: '9 yrs',  loc: 'Tabeebi Clinic, Karrada',    initials: 'OK', hue: 190 },
  { id: 'd3', name: 'Dr. Ruqaya Haidar',     specialty: 'Dental · Pediatric Dent.', rating: 4.7, reviews: 198, price: 25000, today: false, exp: '7 yrs',  loc: 'Al-Waha Health Center',      initials: 'RH', hue: 40  },
  { id: 'd4', name: 'Dr. Bassam Al-Daraji',  specialty: 'Dental · Cosmetic',        rating: 4.9, reviews: 521, price: 60000, today: true,  exp: '15 yrs', loc: 'Zayouna Private, Baghdad',   initials: 'BD', hue: 160 },
  { id: 'd5', name: 'Dr. Hiba Al-Rashid',    specialty: 'Dental · General',         rating: 4.6, reviews: 143, price: 20000, today: true,  exp: '5 yrs',  loc: 'Al-Yarmouk Medical',         initials: 'HR', hue: 15  },
  { id: 'd6', name: 'Dr. Karim Nasser',      specialty: 'Dental · Periodontist',    rating: 4.8, reviews: 308, price: 40000, today: false, exp: '11 yrs', loc: 'Al-Harithiya Clinic',        initials: 'KN', hue: 210 },
];

export const APPOINTMENTS_UPCOMING: Appointment[] = [
  {
    id: 'a1', doctor: 'Dr. Layla Al-Jabari', specialty: 'Dental · Orthodontist',
    date: 'Tomorrow', time: '10:30 AM', status: 'confirmed', clinic: 'Al-Mansour Clinic',
    initials: 'LJ', hue: 175, price: 35000,
  },
  {
    id: 'a2', doctor: 'Dr. Bassam Al-Daraji', specialty: 'Dental · Cosmetic',
    date: 'Apr 28', time: '3:00 PM', status: 'pending', clinic: 'Zayouna Private',
    initials: 'BD', hue: 160, price: 60000,
  },
];

export const APPOINTMENTS_PAST: Appointment[] = [
  { id: 'p1', doctor: 'Dr. Omar Al-Khafaji',  specialty: 'Dental · Oral Surgery', date: 'Apr 11, 2026', time: '11:00 AM', status: 'completed', initials: 'OK', hue: 190 },
  { id: 'p2', doctor: 'Dr. Samir Al-Tai',     specialty: 'Cardiology',            date: 'Mar 22, 2026', time: '2:30 PM',  status: 'completed', initials: 'ST', hue: 15 },
  { id: 'p3', doctor: 'Dr. Hiba Al-Rashid',   specialty: 'Dental · General',      date: 'Feb 9, 2026',  time: '9:15 AM',  status: 'cancelled', initials: 'HR', hue: 15 },
];

export const RESULTS: Result[] = [
  {
    id: 'r1', doctor: 'Dr. Omar Al-Khafaji', specialty: 'Oral Surgery',
    date: 'Apr 11, 2026', title: 'Post-extraction check-up',
    diagnosis: 'Healing progressing normally. Minor inflammation around socket — prescribed mouthwash.',
    notes: 'Wisdom tooth extraction site inspected at 2-week post-op. Socket closing well with no signs of dry socket or infection. Gum tissue healthy.',
    meds: ['Chlorhexidine 0.12%  ·  rinse 2×/day', 'Ibuprofen 400mg  ·  as needed'],
    next: 'Follow-up in 4 weeks. Resume normal brushing at extraction site.',
    unread: true,
  },
  {
    id: 'r2', doctor: 'Dr. Samir Al-Tai', specialty: 'Cardiology',
    date: 'Mar 22, 2026', title: 'Annual cardiac screening',
    diagnosis: 'Normal ECG. Blood pressure slightly elevated — lifestyle adjustments recommended.',
    notes: 'Resting heart rate 72 bpm. BP 138/86. ECG shows normal sinus rhythm. No structural abnormalities on echo.',
    meds: [],
    next: 'Re-check BP in 3 months. Low-sodium diet, 30 min walking daily.',
    unread: false,
  },
  {
    id: 'r3', doctor: 'Dr. Hiba Al-Rashid', specialty: 'Dental',
    date: 'Jan 14, 2026', title: 'Routine cleaning & exam',
    diagnosis: 'Good oral health overall. Minor gingivitis on lower right.',
    notes: 'Full scaling performed. Patient advised on flossing technique for posterior teeth.',
    meds: [],
    next: 'Next cleaning in 6 months.',
    unread: false,
  },
];

export const NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'reminder', title: 'Appointment tomorrow',    body: 'Dr. Layla Al-Jabari at 10:30 AM · Al-Mansour Clinic', time: '2h ago', unread: true },
  { id: 'n2', type: 'result',   title: 'New result available',    body: 'Dr. Omar Al-Khafaji uploaded your post-extraction report.', time: '5h ago', unread: true },
  { id: 'n3', type: 'confirm',  title: 'Appointment confirmed',   body: 'Dr. Bassam Al-Daraji · Apr 28 at 3:00 PM is confirmed.', time: 'Yesterday', unread: false },
  { id: 'n4', type: 'block',    title: 'Late-cancel warning',     body: '2 more late cancels this month will temporarily block booking.', time: '2 days ago', unread: false },
  { id: 'n5', type: 'reminder', title: 'How was your visit?',     body: 'Rate Dr. Omar Al-Khafaji from Apr 11.', time: '3 days ago', unread: false },
];

export const TICKETS: Ticket[] = [
  { id: 't1', subject: 'Cannot see my April result',   status: 'open',     time: 'Opened 2h ago',   last: 'Support: We are looking into this — reply within 4 hours.' },
  { id: 't2', subject: 'Refund for cancelled booking', status: 'resolved', time: 'Resolved Apr 10', last: 'Refund of IQD 25,000 processed to your card.' },
];

export const TIME_SLOTS: TimeSlot[] = [
  { t: '9:00 AM',  state: 'available' },
  { t: '9:30 AM',  state: 'unavailable' },
  { t: '10:00 AM', state: 'unavailable' },
  { t: '10:30 AM', state: 'available' },
  { t: '11:00 AM', state: 'available' },
  { t: '11:30 AM', state: 'available' },
  { t: '1:00 PM',  state: 'unavailable' },
  { t: '1:30 PM',  state: 'available' },
  { t: '2:00 PM',  state: 'available' },
  { t: '2:30 PM',  state: 'unavailable' },
  { t: '3:00 PM',  state: 'available' },
  { t: '3:30 PM',  state: 'available' },
  { t: '4:00 PM',  state: 'available' },
  { t: '4:30 PM',  state: 'unavailable' },
];

export const DAYS: Day[] = [
  { day: 'Mon', num: 27, month: 'Apr', full: 'Mon Apr 27' },
  { day: 'Tue', num: 28, month: 'Apr', full: 'Tue Apr 28' },
  { day: 'Wed', num: 29, month: 'Apr', full: 'Wed Apr 29' },
  { day: 'Thu', num: 30, month: 'Apr', full: 'Thu Apr 30' },
  { day: 'Fri', num: 1,  month: 'May', full: 'Fri May 1'  },
  { day: 'Sat', num: 2,  month: 'May', full: 'Sat May 2'  },
  { day: 'Sun', num: 3,  month: 'May', full: 'Sun May 3'  },
];

export const iqd = (n: number) => new Intl.NumberFormat('en-US').format(n);
