export const TODAY = new Date()

export const TR_DAYS_SHORT = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
export const TR_DAYS_LONG  = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']
export const TR_MONTHS_LONG = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']

export function fmtDateLong(d: Date): string {
  const dow = (d.getDay() + 6) % 7
  return `${TR_DAYS_LONG[dow]}, ${d.getDate()} ${TR_MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`
}

export function dateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const r = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${r}`
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(d.getDate() + n)
  return r
}
