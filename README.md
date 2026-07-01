# 🏥 Tabeebi+ | Modern Klinik Yönetim Sistemi

**Tabeebi+**, doktorlar ve hastalar arasındaki iletişimi dijitalleştiren, randevu yönetimini, muayene sonuçlarını ve klinik istatistiklerini tek bir platformda birleştiren profesyonel bir sağlık çözümüdür.

---

## 🚀 Özellikler

### 📱 Hasta Mobil Uygulaması (React Native)
- **OTP Tabanlı Giriş:** WhatsApp üzerinden doğrulama kodu ile şifresiz, güvenli giriş.
- **Akıllı Randevu:** Doktorların müsaitlik durumuna göre canlı randevu alımı.
- **Sonuç Takibi:** Muayene sonuçlarını ve doktor tarafından yüklenen PDF raporlarını anında görüntüleme.
- **Bildirim Sistemi:** Randevu onayı, sonuç çıkması ve değerlendirme bildirimleri.
- **Profil Yönetimi:** Kişisel sağlık bilgileri ve geçmiş randevu takibi.

### 💻 Doktor Paneli (Vue.js 3)
- **Canlı Gösterge Paneli:** Günlük randevu sayıları, bekleyen hastalar ve kazanç istatistikleri.
- **Takvim & Liste Görünümü:** Randevuları hem liste hem takvim modunda yönetme.
- **Hasta Yönetimi:** Hızlı hasta arama, geçmiş muayene takibi ve tıbbi notlar.
- **Manuel Randevu:** Doktor/asistan tarafından hasta adına hızlı randevu oluşturma.
- **Muayene Sonuçları:** Hastalara özel teşhis girişi ve PDF rapor yükleme modülü.
- **Çalışma Saatleri:** Günlük ve saatlik bazda muayene slotlarını kolayca açıp kapatma.
- **İstatistikler:** Aylık trend grafikleri, sık görülen şikayetler ve gelir analizi.

### 🔐 Altyapı ve Güvenlik (Laravel + PostgreSQL)
- **Özel API:** Supabase bağımlılığı olmayan, tam kontrollü Laravel mimarisi.
- **Çift Kimlik Sistemi:** Hastalar ve doktorlar için ayrı Sanctum token akışı.
- **Twilio Entegrasyonu:** Randevu bildirimleri ve OTP doğrulaması için otomatik WhatsApp mesajları.
- **Rate Limiting:** OTP endpoint'lerinde brute-force koruması.
- **Veri Gizliliği:** Bağımsız PostgreSQL veritabanı ile veriler tamamen güvende.

---

## 🛠️ Teknoloji Yığını

| Katman | Teknoloji |
|---|---|
| Doktor Paneli | Vue.js 3, Vite, TypeScript |
| Admin Paneli | Next.js 15, TypeScript |
| Mobil | React Native (Expo) |
| Backend | Laravel 11, PHP 8.2 |
| Veritabanı | PostgreSQL 16 |
| Auth | Laravel Sanctum (UUID token) |
| Bildirimler | Twilio WhatsApp & SMS |

---

## 📁 Proje Yapısı

```text
tabeebi+/
├── tabeebi-backend/    # Laravel 11 API + Veritabanı Yönetimi
├── doctor-panel-vue/   # Vue.js 3 Doktor Paneli
├── admin-panel/        # Next.js Admin Paneli
└── mobile/             # React Native Hasta Uygulaması
```

---

## ⚙️ Kurulum ve Çalıştırma

### 1. Backend (Laravel)
```bash
cd tabeebi-backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve --host=0.0.0.0 --port=8000
```

### 2. Doktor Paneli (Vue.js)
```bash
cd doctor-panel-vue
npm install
cp .env.example .env   # VITE_API_BASE_URL=http://localhost:8000
npm run dev
```

### 3. Mobil Uygulama
```bash
cd mobile
npm install
npx expo start --clear
```

---

## 📄 Lisans

Bu proje **omartthr** tarafından geliştirilmiştir. Tüm hakları saklıdır.
