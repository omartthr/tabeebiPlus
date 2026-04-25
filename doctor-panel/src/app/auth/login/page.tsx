'use client';
import React, { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { setDoctorSession } from '@/hooks/useDoctor';

type Step = 'phone' | 'otp';

export default function LoginPage() {
  const [step, setStep]       = useState<Step>('phone');
  const [countryCode, setCountryCode] = useState('964');
  const [phone, setPhone]     = useState('');
  const [otp, setOtp]         = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

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
    if (digits.length === 4) { setOtp(digits.split('')); otpRefs[3].current?.focus(); }
  };

  const sendOtp = async () => {
    setError('');
    const clean = phone.replace(/\D/g, '').replace(/^0/, '');
    if (clean.length < 9) { setError('Geçerli bir telefon numarası girin.'); return; }
    const fullPhone = countryCode + clean;
    setLoading(true);

    // 1. Önce veritabanında bu numara kayıtlı mı kontrol et (Hızlı geri bildirim için)
    const { data: doc, error: dbErr } = await supabase
      .from('doctor_registrations')
      .select('id')
      .eq('phone', fullPhone)
      .maybeSingle();

    if (dbErr || !doc) {
      setLoading(false);
      setError('Bu numaraya ait bir doktor kaydı bulunamadı. Lütfen önce kayıt olun.');
      return;
    }

    // 2. Kayıt varsa OTP gönder
    const { error: fnErr } = await supabase.functions.invoke('send-otp', {
      body: { phone: fullPhone, country_code: countryCode }
    });

    setLoading(false);

    if (fnErr) { 
      setError('Kod gönderilemedi. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.'); 
      return; 
    }
    setPhone(fullPhone);
    setStep('otp');
  };

  const verifyOtp = async () => {
    setError('');
    const code = otp.join('');
    if (code.length < 4) { setError('4 haneli kodu girin.'); return; }
    setLoading(true);

    // 1. Verify OTP
    const { data: verifyData, error: verifyErr } = await supabase.functions.invoke('verify-otp', { body: { phone, code } });
    if (verifyErr || !verifyData?.valid) {
      setLoading(false);
      setError('Kod hatalı veya süresi dolmuş.');
      return;
    }

    // 2. Use doctor data from backend
    const doc = verifyData?.doctor;

    if (!doc) {
      // Doğrulandı ama kayıt yoksa kayıt sayfasına
      window.location.replace('/auth/register');
      return;
    }

    setDoctorSession({
      id: doc.id,
      phone,
      name: doc.name,
      surname: doc.surname,
      specialty: doc.specialty,
      status: doc.status,
    });

    if (doc.status === 'approved') {
      window.location.replace('/dashboard');
    } else {
      window.location.replace('/auth/pending');
    }
  };

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
          <div className={`step-dot${step === 'phone' ? ' active' : ' done'}`} />
          <div className={`step-dot${step === 'otp' ? ' active' : ''}`} />
        </div>

        {error && <div className="auth-error">{error}</div>}

        {/* Phone step */}
        {step === 'phone' && (
          <div className="fade-up">
            <div className="auth-title">Doktor Girişi</div>
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
              <span style={{ fontSize: 14, color: 'var(--ink-500)' }}>Hesabınız yok mu? </span>
              <button className="auth-link" onClick={() => window.location.href = '/auth/register'}>Kayıt Olun</button>
            </div>
          </div>
        )}

        {/* OTP step */}
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
              {loading ? 'Doğrulanıyor…' : 'Giriş Yap'}
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
      </div>
    </div>
  );
}
