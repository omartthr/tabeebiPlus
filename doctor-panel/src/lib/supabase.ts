import { createClient } from '@supabase/supabase-js';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(URL, KEY);

export type DoctorReg = {
  id: string;
  phone: string;
  name: string;
  surname: string;
  age: number | null;
  specialty: string;
  clinic_name: string | null;
  location_address: string | null;
  location_lat: number | null;
  location_lng: number | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};
