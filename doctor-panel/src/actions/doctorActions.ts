const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Token yönetimi
function getToken() {
  return localStorage.getItem('tabeebi_doctor_token') || ''
}

export function setAuthToken(token: string) {
  localStorage.setItem('tabeebi_doctor_token', token)
}

export function clearAuthToken() {
  localStorage.removeItem('tabeebi_doctor_token')
}

// Ortak Fetch sarmalayıcısı
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = getToken()
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  }

  try {
    const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers })
    const data = await res.json().catch(() => null)
    
    if (!res.ok) {
      return { data: null, error: data?.error || data?.message || `HTTP ${res.status}` }
    }
    return { data, error: null }
  } catch (err: any) {
    return { data: null, error: err.message }
  }
}

// ============================================================================
// 1. KİMLİK DOĞRULAMA & KAYIT (Auth)
// ============================================================================
export async function checkDoctorExists(phone: string) {
  const { data } = await fetchAPI(`/doctor-panel/auth/check?phone=${encodeURIComponent(phone)}`)
  return data
}

export async function sendOtpAction(phone: string, countryCode: string) {
  return await fetchAPI('/doctor-panel/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ phone })
  })
}

export async function verifyOtpAction(phone: string, code: string) {
  const res = await fetchAPI('/doctor-panel/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ phone, code })
  })
  if (res.data?.token) {
    setAuthToken(res.data.token)
  }
  return res
}

export async function registerDoctor(doctorData: any) {
  const res = await fetchAPI('/doctor-panel/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      phone: doctorData.phone,
      name: doctorData.name,
      surname: doctorData.surname,
      specialty: doctorData.specialty,
      clinic_name: doctorData.clinic_name,
      location_address: doctorData.location_address,
      location_lat: doctorData.location_lat,
      location_lng: doctorData.location_lng,
    })
  })
  if (res.data?.token) {
    setAuthToken(res.data.token)
  }
  return res
}

export async function getDoctorByPhone(phone: string) {
  const { data } = await fetchAPI(`/doctor-panel/auth/check?phone=${encodeURIComponent(phone)}`)
  return data
}

// ============================================================================
// 2. PROFİL
// ============================================================================
export async function getDoctorById(id: string) {
  return await fetchAPI('/doctor-panel/profile')
}

export async function getDoctorRegistrationAction(doctorId: string) {
  return await fetchAPI('/doctor-panel/profile')
}

export async function getDoctorInfoAction(doctorsId: string) {
  return await fetchAPI('/doctor-panel/profile')
}

export async function updateDoctorProfileAction(doctorId: string, doctorData: any, schedule: any) {
  const res = await fetchAPI('/doctor-panel/profile', {
    method: 'PUT',
    body: JSON.stringify({ ...doctorData, schedule })
  })
  return { error: res.error, regData: res.data?.registration }
}

export async function getDoctorPriceAction(doctorsId: string) {
  const { data, error } = await fetchAPI('/doctor-panel/profile')
  return { data: data ? { price: data.price } : null, error }
}

// ============================================================================
// 3. TAKVİM (SCHEDULE)
// ============================================================================
export async function getDoctorScheduleAction(doctorId: string) {
  return await fetchAPI('/doctor-panel/schedule')
}

export async function updateDoctorScheduleAction(doctorId: string, schedule: any) {
  return await fetchAPI('/doctor-panel/schedule', {
    method: 'PUT',
    body: JSON.stringify({ schedule })
  })
}

// ============================================================================
// 4. RANDEVULAR & DASHBOARD
// ============================================================================
export async function getDashboardAppointments(doctorId: string, doctorsId: string | null | undefined) {
  return await fetchAPI('/doctor-panel/dashboard')
}

export async function checkAppointmentCollisionAction(date: string, time: string, doctorId: string, doctorsId: string | null | undefined) {
  return await fetchAPI(`/doctor-panel/appointments/collision?date=${date}&time=${time}`)
}

export async function createAppointmentAction(payload: any) {
  return await fetchAPI('/doctor-panel/appointments/manual', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export async function updateAppointmentStatus(id: string, status: string) {
  return await fetchAPI(`/doctor-panel/appointments/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  })
}

export async function markReportUploadedAction(appointmentId: string) {
  return await fetchAPI(`/doctor-panel/appointments/${appointmentId}/report-uploaded`, {
    method: 'PATCH'
  })
}

export async function getPendingCountAction(doctorId: string, doctorsId: string | null | undefined) {
  const { data, error } = await fetchAPI('/doctor-panel/appointments/pending-count')
  return { count: data?.count || 0, error }
}

// ============================================================================
// 5. HASTALAR & SONUÇLAR
// ============================================================================
export async function getDoctorPatientsAction(doctorId: string, doctorsId: string | null | undefined) {
  return await fetchAPI('/doctor-panel/patients')
}

export async function lookupPatientAction(phone: string) {
  return await fetchAPI(`/doctor-panel/patients/lookup?phone=${encodeURIComponent(phone)}`)
}

export async function getPatientHistoryAction(phone: string) {
  return await fetchAPI(`/doctor-panel/patients/history?phone=${encodeURIComponent(phone)}`)
}

export async function createTemporaryPatientAction(name: string, phone: string) {
  return await fetchAPI('/doctor-panel/patients/temporary', {
    method: 'POST',
    body: JSON.stringify({ name, phone })
  })
}

export async function getPendingResultsAction(doctorId: string, doctorsId: string | null | undefined) {
  return await fetchAPI('/doctor-panel/pending-results')
}

export async function getDoctorStatisticsAction(doctorId: string, doctorsId: string | null | undefined) {
  return await fetchAPI('/doctor-panel/statistics')
}

// ============================================================================
// 6. BİLDİRİMLER (Legacy)
// ============================================================================
export async function notifyDoctorAction(phone: string, name: string, type: string) {
  // Laravel kayıt işleminde otomatik hallediyor.
  return { error: null }
}

export async function insertNotificationAction(payload: any) {
  return await fetchAPI('/doctor-panel/notifications', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}
