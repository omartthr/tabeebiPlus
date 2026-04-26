export const TODAY = new Date();

export const DOCTOR = {
  name: 'Dr. Layla Al-Jabari',
  specialty: 'Ortodonti Uzmanı · Diş Hekimi',
  clinic: 'Al-Mansour Polikliniği',
  initials: 'LJ',
  hue: 175,
};

export const PATIENTS = [
  { id: 'p1',  patientId: '#4821', name: 'Ahmed Al-Rubaie',  phone: '+964 750 123 4567', age: 32, hue: 200, initials: 'AR' },
  { id: 'p2',  patientId: '#9912', name: 'Fatima Al-Saadi',  phone: '+964 770 234 1129', age: 28, hue: 320, initials: 'FS' },
  { id: 'p3',  patientId: '#3304', name: 'Omar Hassan',      phone: '+964 750 887 4421', age: 45, hue: 30,  initials: 'OH' },
  { id: 'p4',  patientId: '#7725', name: 'Zainab Al-Maliki', phone: '#964 780 552 3318', age: 19, hue: 280, initials: 'ZM' },
  { id: 'p5',  patientId: '#1109', name: 'Hiba Al-Rashid',   phone: '+964 770 119 2204', age: 24, hue: 15,  initials: 'HR' },
];

const REASONS = [
  'Ortodonti kontrolü',
  'İlk muayene',
  'Tel takılması',
  'Telin sıkılması',
  'Pekiştirici plak kontrolü',
  'Acil ağrı şikayeti',
  'Aparey ayarı',
  'Konsültasyon',
];

export type AppointmentStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed';

export interface Appointment {
  id: string;
  date: Date;
  dateKey: string;
  time: string;
  duration: number;
  patient: typeof PATIENTS[0];
  reason: string;
  status: AppointmentStatus;
  notes: string | null;
  price: number;
}

function buildAppointments(): Appointment[] {
  const list: Appointment[] = [];
  const dayDefs = [
    { offset: 0, items: [
      { time: '09:00', dur: 30, patient: 0, reason: 0, status: 'confirmed' as const, notes: 'Üst çene tel sıkılması – son kontrolde iyi ilerleme.' },
      { time: '10:00', dur: 45, patient: 1, reason: 1, status: 'pending'   as const, notes: 'İlk muayene · panoramik röntgen istendi.' },
      { time: '11:00', dur: 30, patient: 2, reason: 5, status: 'confirmed' as const, notes: 'Sol alt 6 numaralı dişte ağrı.' },
      { time: '13:30', dur: 30, patient: 3, reason: 2, status: 'completed' as const },
      { time: '14:00', dur: 30, patient: 4, reason: 6, status: 'confirmed' as const },
    ]},
    { offset: 1, items: [
      { time: '10:00', dur: 30, patient: 0, reason: 4, status: 'confirmed' as const },
      { time: '11:00', dur: 60, patient: 1, reason: 7, status: 'confirmed' as const },
    ]},
    { offset: 2, items: [
      { time: '09:00', dur: 30, patient: 2, reason: 0, status: 'confirmed' as const },
    ]},
  ];

  let id = 1;
  for (const d of dayDefs) {
    const date = new Date(TODAY);
    date.setDate(TODAY.getDate() + d.offset);
    for (const it of d.items) {
      list.push({
        id: 'apt' + (id++),
        date,
        dateKey: date.toISOString().slice(0, 10),
        time: it.time,
        duration: it.dur,
        patient: PATIENTS[it.patient],
        reason: REASONS[it.reason],
        status: it.status,
        notes: (it as any).notes || null,
        price: 35000,
      });
    }
  }
  return list;
}

export const APPOINTMENTS = buildAppointments();

export const TR_DAYS_SHORT = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
export const TR_DAYS_LONG  = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
export const TR_MONTHS_LONG = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

export function fmtDateLong(d: Date): string {
  const dow = (d.getDay() + 6) % 7;
  return `${TR_DAYS_LONG[dow]}, ${d.getDate()} ${TR_MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`;
}

export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const r = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${r}`;
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(d.getDate() + n);
  return r;
}
