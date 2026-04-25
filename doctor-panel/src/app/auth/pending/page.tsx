'use client';
import { useEffect, useState } from 'react';
import { getDoctorSession, clearDoctorSession } from '@/hooks/useDoctor';
import { supabase } from '@/lib/supabase';

export default function PendingPage() {
  const [name, setName] = useState('');
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const s = getDoctorSession();
    if (!s) { window.location.replace('/auth/register'); return; }
    setName(s.name);
  }, []);

  const reCheck = async () => {
    const s = getDoctorSession();
    if (!s) return;
    setChecking(true);
    const { data } = await supabase
      .from('doctor_registrations')
      .select('status')
      .eq('id', s.id)
      .single();
    setChecking(false);
    if (data?.status === 'approved') {
      const updated = { ...s, status: 'approved' as const };
      localStorage.setItem('tabeebi_doctor_session', JSON.stringify(updated));
      window.location.replace('/dashboard');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div className="auth-logo" style={{ justifyContent: 'center' }}>
          <div className="auth-logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <div className="auth-logo-name">tabeebi<span>+</span></div>
        </div>

        <div className="pending-icon">
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>
          </svg>
        </div>

        <div className="auth-title" style={{ marginBottom: 8 }}>Başvurunuz İnceleniyor</div>
        <div className="auth-sub" style={{ marginBottom: 24 }}>
          {name ? `Merhaba Dr. ${name},` : 'Merhaba,'} başvurunuz alındı.<br />
          Ekibimiz bilgilerinizi inceledikten sonra<br />
          <strong>WhatsApp üzerinden bildirim gönderilecektir.</strong>
        </div>

        <ul className="pending-steps" style={{ textAlign: 'left', marginBottom: 28 }}>
          <li><div className="step-circle done">✓</div>WhatsApp ile doğrulama yapıldı</li>
          <li><div className="step-circle done">✓</div>Başvuru formu gönderildi</li>
          <li><div className="step-circle wait">⏳</div>Ekibimiz başvurunuzu inceliyor</li>
          <li><div className="step-circle next">4</div>Onay bildirimi WhatsApp&apos;a gelecek</li>
        </ul>

        <button className="btn btn-primary" style={{ width: '100%', height: 48 }} onClick={reCheck} disabled={checking}>
          {checking ? 'Kontrol ediliyor…' : 'Onay Durumumu Kontrol Et'}
        </button>

        <button className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: 10 }}
          onClick={() => { clearDoctorSession(); window.location.replace('/auth/login'); }}>
          Farklı Hesapla Giriş Yap
        </button>
      </div>
    </div>
  );
}
