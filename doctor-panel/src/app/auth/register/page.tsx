'use client';
import React, { useState, useRef, useCallback, useEffect, type ComponentType } from 'react';
import { supabase } from '@/lib/supabase';
import { setDoctorSession } from '@/hooks/useDoctor';

const SPECIALTIES = [
  'Ortodonti', 'Genel Diş Hekimliği', 'Cerrahi Diş Hekimliği', 'Periodontoloji', 'Endodonti',
  'Kardiyoloji', 'Nöroloji', 'Genel Cerrahi', 'İç Hastalıkları (Dahiliye)', 'Pediatri',
  'Ortopedi ve Travmatoloji', 'Göz Hastalıkları', 'Kulak Burun Boğaz (KBB)',
  'Dermatoloji (Cildiye)', 'Kadın Hastalıkları ve Doğum', 'Üroloji',
  'Psikiyatri', 'Radyoloji', 'Fizik Tedavi ve Rehabilitasyon',
  'Acil Tıp', 'Gastroenteroloji', 'Endokrinoloji', 'Hematoloji', 'Onkoloji',
];

type Step = 'phone' | 'otp' | 'info' | 'location';

const STEP_ORDER: Step[] = ['phone', 'otp', 'info', 'location'];

export default function RegisterPage() {
  // Load MapPicker only on client to avoid SSR (Leaflet doesn't support SSR)
  const [MapPicker, setMapPickerComp] = useState<ComponentType<{ onChange: (lat: number, lng: number, addr: string) => void }> | null>(null);
  useEffect(() => {
    import('@/components/MapPicker').then(m => setMapPickerComp(() => m.default));
  }, []);

  const [step, setStep]     = useState<Step>('phone');
  const [countryCode, setCountryCode] = useState('964');
  const [phone, setPhone]   = useState('');
  const [otp, setOtp]       = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const [name, setName]         = useState('');
  const [surname, setSurname]   = useState('');
  const [age, setAge]           = useState('');
  const [specialty, setSpecialty] = useState('');
  const [clinic, setClinic]     = useState('');

  const [locLat, setLocLat] = useState<number | null>(null);
  const [locLng, setLocLng] = useState<number | null>(null);
  const [locAddr, setLocAddr] = useState('');

  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const stepIdx = STEP_ORDER.indexOf(step);

  /* ── OTP helpers ── */
  const handleOtpChange = (i: number, val: string) => {
    const d = val.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[i] = d;
    setOtp(next);
    if (d && i < 3) otpRefs[i + 1].current?.focus();
  };
  const handleOtpKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs[i - 1].current?.focus();
  };
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (digits.length === 4) {
      setOtp(digits.split(''));
      otpRefs[3].current?.focus();
    }
  };

  /* ── Step 1: send OTP ── */
  const sendOtp = async () => {
    setError('');
    const clean = phone.replace(/\D/g, '').replace(/^0/, '');
    if (clean.length < 9) { setError('Geçerli bir telefon numarası girin.'); return; }
    const fullPhone = countryCode + clean;
    setLoading(true);
    const { error: fnErr } = await supabase.functions.invoke('send-otp', {
      body: { phone: fullPhone, country_code: countryCode }
    });
    setLoading(false);
    if (fnErr) { setError('Kod gönderilemedi. Tekrar deneyin.'); return; }
    setPhone(fullPhone);
    setStep('otp');
  };

  /* ── Step 2: verify OTP ── */
  const verifyOtp = async () => {
    setError('');
    const code = otp.join('');
    if (code.length < 4) { setError('4 haneli kodu girin.'); return; }
    setLoading(true);

    const { data, error: fnErr } = await supabase.functions.invoke('verify-otp', { body: { phone, code } });
    if (fnErr || !data?.valid) {
      setLoading(false);
      setError('Kod hatalı veya süresi dolmuş.');
      return;
    }

    // Check if phone is already registered (using data from backend)
    const existing = data?.doctor;

    setLoading(false);

    if (existing) {
      if (existing.status === 'approved') {
        window.location.replace('/auth/login');
      } else {
        setDoctorSession({ id: existing.id, phone, name: '', surname: '', specialty: '', status: existing.status });
        window.location.replace('/auth/pending');
      }
      return;
    }

    setStep('info');
  };

  /* ── Step 3: validate info → go to map ── */
  const goToLocation = () => {
    if (!name.trim() || !surname.trim() || !specialty) {
      setError('Ad, Soyad ve Uzmanlık alanı zorunludur.');
      return;
    }
    setError('');
    setStep('location');
  };

  /* ── Step 4: map pick callback ── */
  const handleMapChange = useCallback((lat: number, lng: number, addr: string) => {
    setLocLat(lat); setLocLng(lng); setLocAddr(addr);
  }, []);

  /* ── Submit registration ── */
  const submit = async () => {
    if (!locLat || !locLng) { setError('Lütfen haritadan konumunuzu seçin.'); return; }
    setError('');
    setLoading(true);

    const { data: inserted, error: dbErr } = await supabase
      .from('doctor_registrations')
      .insert({
        phone,
        name: name.trim(),
        surname: surname.trim(),
        age: age ? parseInt(age) : null,
        specialty,
        clinic_name: clinic.trim() || null,
        location_address: locAddr,
        location_lat: locLat,
        location_lng: locLng,
        status: 'pending',
      })
      .select('id')
      .single();

    if (dbErr) {
      setLoading(false);
      setError('Kayıt sırasında bir hata oluştu: ' + dbErr.message);
      return;
    }

    // Başvuru alındı bildirimi — fire and forget
    supabase.functions.invoke('notify-doctor', {
      body: { phone, name: name.trim(), type: 'received' },
    });

    setLoading(false);
    setDoctorSession({ id: inserted.id, phone, name: name.trim(), surname: surname.trim(), specialty, status: 'pending' });
    window.location.replace('/auth/pending');
  };

  /* ── Render ── */
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <div className="auth-logo-name">tabeebi<span>+</span></div>
        </div>

        {/* Step dots */}
        <div className="step-dots">
          {STEP_ORDER.map((s, i) => (
            <div key={s} className={`step-dot${i < stepIdx ? ' done' : ''}${i === stepIdx ? ' active' : ''}`} />
          ))}
        </div>

        {error && <div className="auth-error">{error}</div>}

        {/* ─── Step 1: Phone ─── */}
        {step === 'phone' && (
          <div className="fade-up">
            <div className="auth-title">Doktor Kaydı</div>
            <div className="auth-sub" style={{ marginBottom: 24 }}>WhatsApp numaranıza doğrulama kodu göndereceğiz.</div>
            <div className="field">
              <label>Telefon Numarası</label>
              <div className="phone-wrap">
                <select
                  className="phone-prefix-select"
                  value={countryCode}
                  onChange={e => setCountryCode(e.target.value)}
                >
                  <option value="964">🇮🇶 +964</option>
                  <option value="90">🇹🇷 +90</option>
                </select>
                <input
                  className="phone-input"
                  placeholder={countryCode === '90' ? '532 123 4567' : '750 123 4567'}
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendOtp()}
                  maxLength={13}
                  inputMode="tel"
                />
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 20, height: 48 }} onClick={sendOtp} disabled={loading}>
              {loading ? 'Gönderiliyor…' : 'WhatsApp Kodu Gönder'}
            </button>
            <div className="auth-divider"><span>veya</span></div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 14, color: 'var(--ink-500)' }}>Hesabınız var mı? </span>
              <button className="auth-link" onClick={() => window.location.href = '/auth/login'}>Giriş Yapın</button>
            </div>
          </div>
        )}

        {/* ─── Step 2: OTP ─── */}
        {step === 'otp' && (
          <div className="fade-up">
            <div className="auth-title">Kodu Girin</div>
            <div className="auth-sub" style={{ marginBottom: 8 }}>WhatsApp&apos;a gönderilen 4 haneli kodu girin.</div>
            <div style={{ fontSize: 13, color: 'var(--teal-700)', fontWeight: 600, marginBottom: 4 }}>+{phone}</div>
            <div className="otp-row" onPaste={handleOtpPaste}>
              {otp.map((v, i) => (
                <input
                  key={i}
                  ref={otpRefs[i]}
                  className={`otp-input${v ? ' filled' : ''}`}
                  maxLength={1}
                  inputMode="numeric"
                  value={v}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKey(i, e)}
                />
              ))}
            </div>
            <button className="btn btn-primary" style={{ width: '100%', height: 48 }} onClick={verifyOtp} disabled={loading}>
              {loading ? 'Doğrulanıyor…' : 'Doğrula ve Devam Et'}
            </button>
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button className="auth-link" onClick={() => { setOtp(['','','','']); setStep('phone'); }}>
                ← Numarayı Değiştir
              </button>
              <span style={{ color: 'var(--ink-300)', margin: '0 10px' }}>·</span>
              <button className="auth-link" onClick={sendOtp} disabled={loading}>Tekrar Gönder</button>
            </div>
          </div>
        )}

        {/* ─── Step 3: Personal Info ─── */}
        {step === 'info' && (
          <div className="fade-up">
            <div className="auth-title">Bilgileriniz</div>
            <div className="auth-sub" style={{ marginBottom: 4 }}>Başvurunuz için kişisel bilgilerinizi girin.</div>
            <div className="fields-grid">
              <div className="fields-row">
                <div className="field">
                  <label>Ad *</label>
                  <input className="field-input" placeholder="Ahmet" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="field">
                  <label>Soyad *</label>
                  <input className="field-input" placeholder="Yılmaz" value={surname} onChange={e => setSurname(e.target.value)} />
                </div>
              </div>
              <div className="fields-row">
                <div className="field">
                  <label>Yaş</label>
                  <input className="field-input" placeholder="35" type="number" min="22" max="80" value={age} onChange={e => setAge(e.target.value)} />
                </div>
                <div className="field">
                  <label>Klinik Adı</label>
                  <input className="field-input" placeholder="Al-Mansour Polikliniği" value={clinic} onChange={e => setClinic(e.target.value)} />
                </div>
              </div>
              <div className="field">
                <label>Uzmanlık Alanı *</label>
                <select className="field-select" value={specialty} onChange={e => setSpecialty(e.target.value)}>
                  <option value="">Seçiniz…</option>
                  {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 22, height: 48 }} onClick={goToLocation}>
              İlerle: Konumu Belirle →
            </button>
          </div>
        )}

        {/* ─── Step 4: Location ─── */}
        {step === 'location' && (
          <div className="fade-up">
            <div className="auth-title">Klinik Konumu</div>
            <div className="auth-sub" style={{ marginBottom: 16 }}>Haritada kliniğinizin bulunduğu yere tıklayın.</div>
            <div className="map-label">Harita</div>
            {MapPicker
              ? <MapPicker onChange={handleMapChange} />
              : <div style={{ height: 240, background: 'var(--ink-50)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-400)', fontSize: 14 }}>Harita yükleniyor…</div>
            }
            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: 20, height: 48 }}
              onClick={submit}
              disabled={loading || !locLat}
            >
              {loading ? 'Kaydediliyor…' : 'Başvuruyu Gönder'}
            </button>
            <button className="btn btn-outline btn-sm" style={{ width: '100%', marginTop: 8 }} onClick={() => setStep('info')}>
              ← Geri Dön
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
