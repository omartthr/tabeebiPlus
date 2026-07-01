import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getDoctorById, clearAuthToken } from '@/actions/doctorActions'

export type DoctorSession = {
  id: string
  doctors_id?: string | null
  phone: string
  name: string
  surname: string
  specialty: string
  clinic_name?: string | null
  location_address?: string | null
  location_lat?: number | null
  location_lng?: number | null
  status: 'pending' | 'approved' | 'rejected'
}

const SESSION_KEY = 'tabeebi_doctor_session'

export function getDoctorSession(): DoctorSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as DoctorSession) : null
  } catch {
    return null
  }
}

export function setDoctorSession(s: DoctorSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(s))
}

export function clearDoctorSession() {
  localStorage.removeItem(SESSION_KEY)
  clearAuthToken()
}

export function useRequireDoctor() {
  const doctor  = ref<DoctorSession | null>(null)
  const loading = ref(true)
  const router  = useRouter()

  onMounted(async () => {
    const s = getDoctorSession()
    if (!s) {
      router.replace('/auth/login')
      return
    }

    const { data: doc, error } = await getDoctorById(s.id)

    // On network error keep cached session alive so the UI stays usable offline.
    if (error && !error.startsWith('HTTP 4')) {
      doctor.value = s
      loading.value = false
      return
    }

    // 401 / 403 / 404 → session no longer valid
    if (error || !doc) {
      clearDoctorSession()
      router.replace('/auth/login')
      return
    }

    const fresh: DoctorSession = {
      id:               doc.id,
      doctors_id:       doc.doctors_id ?? null,
      phone:            s.phone,
      name:             doc.name,
      surname:          doc.surname,
      specialty:        doc.specialty,
      clinic_name:      doc.clinic_name ?? null,
      location_address: doc.location_address ?? null,
      location_lat:     doc.location_lat ?? null,
      location_lng:     doc.location_lng ?? null,
      status:           doc.status,
    }
    setDoctorSession(fresh)

    if (doc.status !== 'approved') {
      router.replace('/auth/pending')
    } else {
      doctor.value  = fresh
      loading.value = false
    }
  })

  return { doctor, loading }
}
