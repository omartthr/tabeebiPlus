-- =============================================
-- Tabeebi+ — Güncel Veritabanı Şeması
-- Kaynak: Supabase Schema Visualizer (Haziran 2026)
-- 9 Tablo | Laravel Migration Referansı
-- =============================================

-- 1. PATIENTS (Hasta — Mobil Uygulama Kullanıcıları)
-- 9 kolon
CREATE TABLE IF NOT EXISTS public.patients (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id       UUID UNIQUE,              -- Supabase Auth bağlantısı
  phone         TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  avatar_hue    INTEGER DEFAULT 175,
  patient_code  TEXT,                     -- Hasta takip kodu
  is_registered BOOLEAN DEFAULT FALSE,    -- Geçici hasta mı?
  push_token    TEXT,                     -- FCM push notification token
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. DOCTORS (Onaylanmış Doktorlar — Mobil'de listelenir)
-- 18 kolon
CREATE TABLE IF NOT EXISTS public.doctors (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  specialty       TEXT NOT NULL,
  initials        TEXT NOT NULL,
  hue             INTEGER DEFAULT 200,
  rating          NUMERIC(3,1),           -- nullable
  reviews         INTEGER DEFAULT 0,
  price           TEXT NOT NULL,          -- IQD cinsinden metin
  loc             TEXT NOT NULL,          -- Kısa konum
  exp             TEXT NOT NULL,          -- "9 yrs" formatı
  today           BOOLEAN DEFAULT FALSE,
  is_active       BOOLEAN DEFAULT TRUE,
  registration_id UUID,                   -- doctor_registrations.id bağlantısı
  location_address TEXT,
  location_lat    FLOAT,
  location_lng    FLOAT,
  schedule        JSONB,                  -- {"mon":{"isOpen":true,"slots":[...]}}
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 3. DOCTOR_REGISTRATIONS (Doktor Başvuruları — Web Panel)
-- 17 kolon
CREATE TABLE IF NOT EXISTS public.doctor_registrations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone            TEXT UNIQUE NOT NULL,
  name             TEXT NOT NULL,
  surname          TEXT NOT NULL,
  specialty        TEXT NOT NULL,
  clinic_name      TEXT,
  location_address TEXT,
  location_lat     FLOAT,
  location_lng     FLOAT,
  status           TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'approved', 'rejected')),
  price            TEXT,                  -- Ücret (IQD)
  exp_years        INTEGER,               -- Deneyim yılı
  doctors_id       UUID,                  -- Onaylandığında doctors.id ile eşlenir
  birth_date       DATE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  approved_at      TIMESTAMPTZ
);

-- 4. DOCTOR_SCHEDULES (Doktor Çalışma Saatleri)
-- 3 kolon
CREATE TABLE IF NOT EXISTS public.doctor_schedules (
  doctor_registration_id UUID PRIMARY KEY REFERENCES public.doctor_registrations(id) ON DELETE CASCADE,
  schedule               JSONB NOT NULL,  -- {"mon":{"isOpen":true,"slots":["09:00-10:00",...]}}
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);

-- 5. APPOINTMENTS (Randevular)
-- 23 kolon
CREATE TABLE IF NOT EXISTS public.appointments (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id             UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id              UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  doctor_registration_id UUID REFERENCES public.doctor_registrations(id) ON DELETE SET NULL,
  date                   TEXT NOT NULL,   -- "YYYY-MM-DD" formatı
  time                   TEXT NOT NULL,   -- "10:00" formatı
  status                 TEXT NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending','confirmed','completed','cancelled')),
  payment                TEXT NOT NULL DEFAULT 'cash'
                         CHECK (payment IN ('online','cash')),
  clinic                 TEXT,
  notes                  TEXT,
  duration               INTEGER,         -- Dakika cinsinden süre
  reason                 TEXT,            -- Randevu nedeni (şikayeti)
  price                  TEXT,            -- Ücret snapshot
  patient_name           TEXT,            -- Doktor paneli için ek alan (geçici hasta)
  patient_phone          TEXT,            -- Doktor paneli için ek alan
  report_uploaded        BOOLEAN DEFAULT FALSE,
  pdf_url                TEXT,            -- Yüklenen rapor dosyası
  ai_summary             TEXT,            -- AI özeti (opsiyonel)
  reported               BOOLEAN DEFAULT FALSE,
  reminder_sent          BOOLEAN DEFAULT FALSE,
  rating                 INTEGER,         -- 1-5 hasta puanı
  review                 TEXT,            -- Hasta yorumu
  created_at             TIMESTAMPTZ DEFAULT NOW()
);

-- 6. RESULTS (Muayene Sonuçları — Doktorlar yükler)
-- 12 kolon
CREATE TABLE IF NOT EXISTS public.results (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id     UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id      UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  title          TEXT NOT NULL,
  diagnosis      TEXT,
  notes          TEXT,
  meds           TEXT[] DEFAULT '{}',     -- İlaç listesi (dizi)
  next_steps     TEXT,
  unread         BOOLEAN DEFAULT TRUE,
  date           TEXT NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 7. NOTIFICATIONS (Sistem/Admin tarafından gönderilen bildirimler)
-- 8 kolon
CREATE TABLE IF NOT EXISTS public.notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  type       TEXT NOT NULL DEFAULT 'reminder'
             CHECK (type IN ('reminder','result','confirm','block')),
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  unread     BOOLEAN DEFAULT TRUE,
  time       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SUPPORT_TICKETS (Destek Talepleri)
-- 8 kolon
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id    UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  category      TEXT,                     -- Talep kategorisi
  subject       TEXT NOT NULL,
  message       TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'open'
                CHECK (status IN ('open','in_progress','resolved','closed')),
  last_response TEXT,                     -- Son admin cevabı
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PHONE_OTPS (Geçici OTP kodları — Edge Function yönetir)
-- 4 kolon
CREATE TABLE IF NOT EXISTS public.phone_otps (
  phone      TEXT PRIMARY KEY,
  otp        TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ÖZET: Tablo ve Kolon Sayıları
-- appointments          → 23 kolon
-- doctor_registrations  → 17 kolon (age → exp_years + birth_date ile güncellendi)
-- doctors               → 18 kolon
-- doctor_schedules      → 3 kolon
-- notifications         → 8 kolon
-- patients              → 9 kolon
-- phone_otps            → 4 kolon
-- results               → 12 kolon
-- support_tickets       → 8 kolon
-- TOPLAM: 9 tablo
-- =============================================
