# 🏥 Tabeebi+ | Modern Klinik Yönetim Sistemi

**Tabeebi+**, doktorlar ve hastalar arasındaki iletişimi dijitalleştiren, randevu yönetimini, muayene sonuçlarını ve klinik istatistiklerini tek bir platformda birleştiren profesyonel bir sağlık çözümüdür.

---

## 🚀 Özellikler

### 📱 Hasta Mobil Uygulaması (React Native)
- **OTP Tabanlı Giriş:** WhatsApp/SMS üzerinden doğrulama kodu ile şifresiz, güvenli giriş.
- **Akıllı Randevu:** Doktorların müsaitlik durumuna göre canlı randevu alımı.
- **Sonuç Takibi:** Muayene sonuçlarını ve doktor tarafından yüklenen PDF raporlarını anında görüntüleme.
- **Profil Yönetimi:** Kişisel sağlık bilgileri ve geçmiş randevu takibi.

### 💻 Doktor Yönetim Paneli (Next.js)
- **Canlı Gösterge Paneli:** Günlük randevu sayıları, bekleyen hastalar ve kazanç istatistikleri.
- **Hasta Yönetimi:** 4 haneli özel ID sistemi (#0000) ile hızlı hasta arama ve takibi.
- **Muayene Sonuçları:** Hastalara özel teşhis girişi ve PDF rapor yükleme modülü.
- **Esnek Çalışma Saatleri:** Günlük ve saatlik bazda muayene slotlarını kolayca açıp kapatma.

### 🔐 Altyapı ve Güvenlik (Supabase)
- **Row Level Security (RLS):** Her kullanıcının sadece kendi verisine erişebildiği üst düzey veri güvenliği.
- **Edge Functions:** Twilio entegrasyonu ile otomatik WhatsApp bildirimleri.
- **Veri Gizliliği:** Tüm hassas veriler backend seviyesinde korunmaktadır.

---

## 🛠️ Teknoloji Yığını

- **Frontend (Web):** Next.js 15, TypeScript, Tailwind CSS
- **Mobile:** React Native (Expo)
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions, Storage)
- **Bildirimler:** Twilio API (WhatsApp & SMS)
- **Durum Yönetimi:** Context API / Hooks

---

## 📁 Proje Yapısı

```text
tabeebi+/
├── doctor-panel/    # Next.js Web Uygulaması (Doktorlar için)
├── mobile/          # React Native Uygulaması (Hastalar için)
├── supabase/        # Edge Functions ve Veritabanı Konfigürasyonları
└── BaaS_Supabase/   # Veritabanı Şeması ve RLS Politikaları
```

---

## 📄 Lisans

Bu proje **omartthr** tarafından geliştirilmiştir. Tüm hakları saklıdır.
