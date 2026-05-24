'use server';

import { createClient } from '@supabase/supabase-js';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!URL || !KEY) {
  throw new Error('Supabase credentials missing');
}

// Server-side Supabase client
const supabase = createClient(URL, KEY);

export async function checkDoctorExists(phone: string) {
  const { data, error } = await supabase
    .from('doctor_registrations')
    .select('id')
    .eq('phone', phone)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

export async function sendOtpAction(phone: string, countryCode: string) {
  const { error } = await supabase.functions.invoke('send-otp', {
    body: { phone, country_code: countryCode }
  });
  return { error: error?.message || null };
}

export async function verifyOtpAction(phone: string, code: string) {
  const { data, error } = await supabase.functions.invoke('verify-otp', { 
    body: { phone, code } 
  });
  return { data, error: error?.message || null };
}

export async function getDoctorByPhone(phone: string) {
  const { data } = await supabase
    .from('doctor_registrations')
    .select('id, name, surname, specialty, status')
    .eq('phone', phone)
    .maybeSingle();
  return data;
}

export async function getDoctorById(id: string) {
  const { data, error } = await supabase
    .from('doctor_registrations')
    .select('id, name, surname, specialty, clinic_name, status, doctors_id, location_address, location_lat, location_lng')
    .eq('id', id)
    .maybeSingle();
    
  return { data, error: error?.message || null };
}

export async function registerDoctor(doctorData: any) {
  const { data, error } = await supabase
    .from('doctor_registrations')
    .insert(doctorData)
    .select('id')
    .single();
    
  return { data, error: error?.message || null };
}

export async function notifyDoctorAction(phone: string, name: string, type: string) {
  const { error } = await supabase.functions.invoke('notify-doctor', {
    body: { phone, name, type },
  });
  return { error: error?.message || null };
}

export async function getDashboardAppointments(doctorId: string, doctorsId: string | null | undefined) {
  let query = supabase.from('appointments').select('*, patients(id, name, phone, avatar_hue, patient_code)');
  if (doctorsId) {
    query = query.or(`doctor_registration_id.eq.${doctorId},doctor_id.eq.${doctorsId}`);
  } else {
    query = query.eq('doctor_registration_id', doctorId);
  }
  const { data, error } = await query;
  return { data, error: error?.message || null };
}

export async function updateAppointmentStatus(id: string, status: string) {
  const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
  return { error: error?.message || null };
}

export async function insertNotificationAction(payload: any) {
  const { error } = await supabase.from('notifications').insert(payload);
  return { error: error?.message || null };
}

export async function getDoctorScheduleAction(doctorId: string) {
  const { data, error } = await supabase.from('doctor_schedules').select('schedule').eq('doctor_registration_id', doctorId).maybeSingle();
  return { data, error: error?.message || null };
}

export async function getDoctorPriceAction(doctorsId: string) {
  const { data, error } = await supabase.from('doctors').select('price').eq('id', doctorsId).maybeSingle();
  return { data, error: error?.message || null };
}

export async function lookupPatientAction(phone: string) {
  const { data, error } = await supabase.from('patients').select('*').eq('phone', phone).maybeSingle();
  return { data, error: error?.message || null };
}

export async function checkAppointmentCollisionAction(date: string, time: string, doctorId: string, doctorsId: string | null | undefined) {
  let query = supabase
    .from('appointments')
    .select('id')
    .eq('date', date)
    .eq('time', time)
    .neq('status', 'cancelled');
    
  if (doctorsId) {
    query = query.or(`doctor_registration_id.eq.${doctorId},doctor_id.eq.${doctorsId}`);
  } else {
    query = query.eq('doctor_registration_id', doctorId);
  }
  
  const { data, error } = await query.maybeSingle();
  return { data, error: error?.message || null };
}

export async function createTemporaryPatientAction(name: string, phone: string) {
  const { data, error } = await supabase
    .from('patients')
    .insert({ name, phone, avatar_hue: 175, is_registered: false })
    .select('*')
    .single();
  return { data, error: error?.message || null };
}

export async function createAppointmentAction(payload: any) {
  const { data, error } = await supabase
    .from('appointments')
    .insert(payload)
    .select('*, patients(id, name, phone, avatar_hue, patient_code)')
    .single();
  return { data, error: error?.message || null };
}

export async function getPatientHistoryAction(phone: string) {
  const { data, error } = await supabase
    .from('appointments')
    .select('id, date, time, reason, status, notes, pdf_url')
    .eq('patient_phone', phone)
    .order('date', { ascending: false });
  return { data, error: error?.message || null };
}

export async function getDoctorPatientsAction(doctorId: string, doctorsId: string | null | undefined) {
  let query = supabase
    .from('appointments')
    .select('reason, date, time, patient_name, patient_phone, patients(id, name, phone, avatar_hue)')
    .eq('report_uploaded', true)
    .order('date', { ascending: false });

  if (doctorsId) {
    query = query.or(`doctor_registration_id.eq.${doctorId},doctor_id.eq.${doctorsId}`);
  } else {
    query = query.eq('doctor_registration_id', doctorId);
  }

  const { data, error } = await query;
  return { data, error: error?.message || null };
}

export async function updateDoctorScheduleAction(doctorId: string, schedule: any) {
  const { error: schedErr } = await supabase
    .from('doctor_schedules')
    .upsert({ doctor_registration_id: doctorId, schedule, updated_at: new Date().toISOString() });

  if (schedErr) return { error: schedErr.message };

  const { data: reg } = await supabase
    .from('doctor_registrations')
    .select('doctors_id')
    .eq('id', doctorId)
    .maybeSingle();

  if (reg?.doctors_id) {
    const { error: docErr } = await supabase
      .from('doctors')
      .update({ schedule })
      .eq('id', reg.doctors_id);
    if (docErr) console.error('doctors schedule sync error:', docErr.message);
  }

  return { error: null };
}

export async function getDoctorStatisticsAction(doctorId: string, doctorsId: string | null | undefined) {
  let query = supabase.from('appointments').select('id, price, status, reason, date');
  if (doctorsId) {
    query = query.or(`doctor_registration_id.eq.${doctorId},doctor_id.eq.${doctorsId}`);
  } else {
    query = query.eq('doctor_registration_id', doctorId);
  }
  const { data, error } = await query;
  return { data, error: error?.message || null };
}

export async function getPendingResultsAction(doctorId: string, doctorsId: string | null | undefined) {
  let query = supabase
    .from('appointments')
    .select('id, date, time, reason, price, patient_name, patient_phone, patients(name, phone, avatar_hue, patient_code)')
    .eq('status', 'completed');

  if (doctorsId) {
    query = query.or(`doctor_registration_id.eq.${doctorId},doctor_id.eq.${doctorsId}`);
  } else {
    query = query.eq('doctor_registration_id', doctorId);
  }

  const { data, error } = await query.or('report_uploaded.eq.false,report_uploaded.is.null').order('date', { ascending: false });
  return { data, error: error?.message || null };
}

export async function markReportUploadedAction(appointmentId: string) {
  const { error } = await supabase.from('appointments').update({ report_uploaded: true }).eq('id', appointmentId);
  return { error: error?.message || null };
}

export async function getDoctorRegistrationAction(doctorId: string) {
  const { data, error } = await supabase
    .from('doctor_registrations')
    .select('*')
    .eq('id', doctorId)
    .maybeSingle();
  return { data, error: error?.message || null };
}

export async function getDoctorInfoAction(doctorsId: string) {
  const { data, error } = await supabase
    .from('doctors')
    .select('rating, reviews')
    .eq('id', doctorsId)
    .maybeSingle();
  return { data, error: error?.message || null };
}

export async function updateDoctorProfileAction(doctorId: string, doctorData: any, schedule: any) {
  const { price, exp_years, location_address, location_lat, location_lng } = doctorData;

  const { error: schedErr } = await supabase
    .from('doctor_schedules')
    .upsert({ doctor_registration_id: doctorId, schedule, updated_at: new Date().toISOString() });
  if (schedErr) return { error: schedErr.message };

  const { error: regErr } = await supabase
    .from('doctor_registrations')
    .update({ price, exp_years, location_address, location_lat, location_lng })
    .eq('id', doctorId);
  if (regErr) return { error: regErr.message };

  const { data: reg } = await supabase.from('doctor_registrations').select('*').eq('id', doctorId).maybeSingle();
  if (reg && reg.doctors_id) {
    const { error: docErr } = await supabase
      .from('doctors')
      .update({
        name: `Dr. ${reg.name} ${reg.surname}`,
        specialty: reg.specialty,
        price,
        exp: exp_years + ' yrs',
        loc: reg.clinic_name || 'Kerkük',
        registration_id: reg.id,
        location_address, location_lat, location_lng,
        schedule,
      })
      .eq('id', reg.doctors_id);
    if (docErr) console.error('doctors table sync error:', docErr.message);
  }

  return { error: null, regData: reg };
}

export async function getPendingCountAction(doctorId: string, doctorsId: string | null | undefined) {
  let query = supabase.from('appointments').select('id').eq('status', 'pending');
  if (doctorsId) {
    query = query.or(`doctor_registration_id.eq.${doctorId},doctor_id.eq.${doctorsId}`);
  } else {
    query = query.eq('doctor_registration_id', doctorId);
  }
  const { data, error } = await query;
  return { count: data?.length || 0, error: error?.message || null };
}
