-- =============================================
-- Tabeebi+ Database Schema
-- Architecture:
--   Web Admin Panel → manages doctors, results, notifications
--   Mobile App      → patients only (read doctors, book, view own data)
-- =============================================

-- 1. PATIENTS (mobile users)
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE,           -- links to Supabase Auth user
  phone TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_hue INTEGER DEFAULT 175,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. DOCTORS (managed from web admin panel only)
CREATE TABLE IF NOT EXISTS public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  initials TEXT NOT NULL,
  hue INTEGER DEFAULT 200,
  rating NUMERIC(2,1) DEFAULT 4.5,
  reviews INTEGER DEFAULT 0,
  price INTEGER NOT NULL,
  loc TEXT NOT NULL,
  exp TEXT NOT NULL,
  today BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. APPOINTMENTS
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','confirmed','completed','cancelled')),
  payment TEXT NOT NULL DEFAULT 'cash'
    CHECK (payment IN ('online','cash')),
  clinic TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RESULTS (uploaded by doctors/admin from web)
CREATE TABLE IF NOT EXISTS public.results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.doctors(id),
  appointment_id UUID REFERENCES public.appointments(id),
  title TEXT NOT NULL,
  diagnosis TEXT,
  notes TEXT,
  meds TEXT[] DEFAULT '{}',
  next_steps TEXT,
  unread BOOLEAN DEFAULT TRUE,
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. NOTIFICATIONS (sent by system/admin)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'reminder'
    CHECK (type IN ('reminder','result','confirm','block')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  unread BOOLEAN DEFAULT TRUE,
  time TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- DOCTORS: Mobile patients can only READ active doctors
-- Web admin uses service_role (bypasses RLS) to INSERT/UPDATE/DELETE
CREATE POLICY "Anyone can view active doctors"
  ON public.doctors FOR SELECT
  USING (is_active = TRUE);

-- PATIENTS: Each patient manages only their own profile
CREATE POLICY "Patient can view own profile"
  ON public.patients FOR SELECT
  USING (auth.uid() = auth_id);

CREATE POLICY "Patient can insert own profile"
  ON public.patients FOR INSERT
  WITH CHECK (auth.uid() = auth_id);

CREATE POLICY "Patient can update own profile"
  ON public.patients FOR UPDATE
  USING (auth.uid() = auth_id);

-- APPOINTMENTS: Patient manages only their own
CREATE POLICY "Patient can view own appointments"
  ON public.appointments FOR SELECT
  USING (patient_id = (SELECT id FROM public.patients WHERE auth_id = auth.uid()));

CREATE POLICY "Patient can create appointment"
  ON public.appointments FOR INSERT
  WITH CHECK (patient_id = (SELECT id FROM public.patients WHERE auth_id = auth.uid()));

CREATE POLICY "Patient can cancel own appointment"
  ON public.appointments FOR UPDATE
  USING (patient_id = (SELECT id FROM public.patients WHERE auth_id = auth.uid()));

-- RESULTS: Patient can only READ (web admin uploads results)
CREATE POLICY "Patient can view own results"
  ON public.results FOR SELECT
  USING (patient_id = (SELECT id FROM public.patients WHERE auth_id = auth.uid()));

CREATE POLICY "Patient can mark result as read"
  ON public.results FOR UPDATE
  USING (patient_id = (SELECT id FROM public.patients WHERE auth_id = auth.uid()));

-- NOTIFICATIONS: Patient can only READ + mark as read
CREATE POLICY "Patient can view own notifications"
  ON public.notifications FOR SELECT
  USING (patient_id = (SELECT id FROM public.patients WHERE auth_id = auth.uid()));

CREATE POLICY "Patient can mark notification as read"
  ON public.notifications FOR UPDATE
  USING (patient_id = (SELECT id FROM public.patients WHERE auth_id = auth.uid()));

-- =============================================
-- NOTE: Web Admin Panel uses Supabase service_role key
-- which bypasses all RLS policies above.
-- Never expose service_role key in mobile app!
-- =============================================
