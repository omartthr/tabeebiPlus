'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export type DoctorSession = {
  id: string;
  doctors_id?: string | null;
  phone: string;
  name: string;
  surname: string;
  specialty: string;
  clinic_name: string | null;
  location_address: string | null;
  location_lat: number | null;
  location_lng: number | null;
  status: 'pending' | 'approved' | 'rejected';
};

const KEY = 'tabeebi_doctor_session';

export function getDoctorSession(): DoctorSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as DoctorSession) : null;
  } catch {
    return null;
  }
}

export function setDoctorSession(s: DoctorSession) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function clearDoctorSession() {
  localStorage.removeItem(KEY);
}

export function useRequireDoctor() {
  const [doctor, setDoctor] = useState<DoctorSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = getDoctorSession();
    if (!s) {
      window.location.replace('/auth/login');
      return;
    }

    // Validate session against DB — catches deleted/changed registrations
    supabase
      .from('doctor_registrations')
      .select('id, name, surname, specialty, clinic_name, status, doctors_id, location_address, location_lat, location_lng')
      .eq('id', s.id)
      .maybeSingle()
      .then(({ data: doc }) => {
        if (!doc) {
          clearDoctorSession();
          window.location.replace('/auth/login');
          return;
        }

        const fresh: DoctorSession = {
          id: doc.id,
          doctors_id: doc.doctors_id,
          phone: s.phone,
          name: doc.name,
          surname: doc.surname,
          specialty: doc.specialty,
          clinic_name: doc.clinic_name ?? null,
          location_address: doc.location_address,
          location_lat: doc.location_lat,
          location_lng: doc.location_lng,
          status: doc.status,
        };
        setDoctorSession(fresh);

        if (doc.status !== 'approved') {
          window.location.replace('/auth/pending');
        } else {
          setDoctor(fresh);
          setLoading(false);
        }
      });
  }, []);

  return { doctor, loading };
}
