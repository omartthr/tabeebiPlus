'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export type DoctorSession = {
  id: string;
  phone: string;
  name: string;
  surname: string;
  specialty: string;
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
      .select('id, name, surname, specialty, status')
      .eq('id', s.id)
      .maybeSingle()
      .then(({ data: doc }) => {
        if (!doc) {
          // Row deleted or not found — clear stale session
          clearDoctorSession();
          window.location.replace('/auth/login');
          return;
        }

        // Refresh session with latest DB values
        const fresh: DoctorSession = {
          id: doc.id,
          phone: s.phone,
          name: doc.name,
          surname: doc.surname,
          specialty: doc.specialty,
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
