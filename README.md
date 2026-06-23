# 🏥 Tabeebi+ | Modern Klinik Yönetim Sistemi

**Tabeebi+**, doktorlar ve hastalar arasındaki iletişimi dijitalleştiren, randevu yönetimini, muayene sonuçlarını ve klinik istatistiklerini tek bir platformda birleştiren profesyonel bir sağlık çözümüdür.

---

## 🚀 Özellikler

### 📱 Hasta Mobil Uygulaması (React Native)
- **OTP Tabanlı Giriş:** WhatsApp üzerinden doğrulama kodu ile şifresiz, güvenli giriş.
- **Akıllı Randevu:** Doktorların müsaitlik durumuna göre canlı randevu alımı.
- **Sonuç Takibi:** Muayene sonuçlarını ve doktor tarafından yüklenen PDF raporlarını anında görüntüleme.
- **Profil Yönetimi:** Kişisel sağlık bilgileri ve geçmiş randevu takibi.

### 💻 Doktor ve Yönetici Panelleri (Next.js)
- **Canlı Gösterge Paneli:** Günlük randevu sayıları, bekleyen hastalar ve kazanç istatistikleri.
- **Hasta Yönetimi:** Hızlı hasta arama ve geçmiş takibi.
- **Muayene Sonuçları:** Hastalara özel teşhis girişi ve PDF rapor yükleme modülü.
- **Esnek Çalışma Saatleri:** Günlük ve saatlik bazda muayene slotlarını kolayca açıp kapatma.

### 🔐 Altyapı ve Güvenlik (Laravel + PostgreSQL)
- **Özel API:** Kendi kendine yeten, Supabase bağımlılığı olmayan tam kontrollü Laravel (PHP) mimarisi.
- **Twilio Entegrasyonu:** Randevu bildirimleri ve doğrulama işlemleri için otomatik WhatsApp mesajları.
- **Sanctum Authentication:** API güvenliği için UUID tabanlı modern token yönetimi.
- **Veri Gizliliği:** Bağımsız PostgreSQL veritabanı ile veriler tamamen güvende.

---

## 🛠️ Teknoloji Yığını

- **Frontend (Web):** Next.js 15, TypeScript, Tailwind CSS
- **Mobile:** React Native (Expo)
- **Backend:** Laravel 11, PHP 8.2
- **Veritabanı:** PostgreSQL 16 (Yerel/Portable)
- **Bildirimler:** Twilio SDK (WhatsApp & SMS)

---

## 📁 Proje Yapısı

```text
tabeebi+/
├── tabeebi-backend/ # Ana Sunucu: Laravel 11 API + Veritabanı Yönetimi
├── pgdata/          # PostgreSQL Veritabanı Dosyaları (Yerel Sunucu)
├── doctor-panel/    # Next.js Web Uygulaması (Doktorlar için)
├── admin-panel/     # Next.js Web Uygulaması (Yöneticiler için)
└── mobile/          # React Native Uygulaması (Hastalar için)
```

---

## ⚙️ Kurulum ve Çalıştırma

### 1. Backend (Laravel)
```bash
cd tabeebi-backend
# Bağımlılıkları yükle
composer install
# Ortam dosyasını hazırla ve key oluştur
cp .env.example .env
php artisan key:generate
# Veritabanını ayağa kaldır (PostgreSQL aktif edilmeli)
php artisan migrate --seed
# Sunucuyu başlat
php artisan serve --host=0.0.0.0 --port=8000
```

### 2. Mobil Uygulama
```bash
cd mobile
npm install
npx expo start --clear
```

### 3. Web Panelleri
```bash
cd doctor-panel   # veya admin-panel
npm install
npm run dev
```

---

## 📄 Lisans

Bu proje **omartthr** tarafından geliştirilmiştir. Tüm hakları saklıdır.
