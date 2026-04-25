'use client';
import { useEffect } from 'react';
import { getDoctorSession } from '@/hooks/useDoctor';

export default function Home() {
  useEffect(() => {
    const s = getDoctorSession();
    if (!s) {
      window.location.replace('/auth/register');
    } else if (s.status === 'approved') {
      window.location.replace('/dashboard');
    } else {
      window.location.replace('/auth/pending');
    }
  }, []);

  return null;
}
