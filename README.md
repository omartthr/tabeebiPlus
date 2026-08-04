# 🏥 Tabeebi+ | Modern Dijital Sağlık & Klinik Yönetim Platformu

**Tabeebi+**, hastalar, doktorlar ve klinik yöneticileri arasındaki süreçleri uçtan uca dijitalleştiren; akıllı randevu yönetimi, AI destekli muayene analizi, canlı hasta takibi ve gelişmiş klinik istatistiklerini tek bir monorepo mimarisinde buluşturan kapsamlı bir sağlık ekosistemidir.

---

## 📐 Sistem Mimarisi ve Modüller

Tabeebi+ monoreposu 4 ana modülden oluşmaktadır:

```text
tabeebi+/
├── ⚙️ tabeebi-backend/    # Laravel 11 (PHP 8.2) RESTful API Sunucusu
├── 🩺 doctor-panel/        # Vue 3 + Vite + TypeScript Doktor Yönetim Paneli
├── 🛡️ admin-panel/         # Next.js 15 SuperAdmin Yönetim Paneli
└── 📱 mobile_flutter/      # Flutter (Dart) Hasta Mobil Uygulaması
```

---

## 🚀 Öne Çıkan Özellikler

### 📱 1. Hasta Mobil Uygulaması (Flutter)
* **WhatsApp / SMS OTP Giriş:** Şifresiz, hızlı ve Twilio destekli doğrulama kodu ile giriş.
* **Akıllı Randevu Alma:** Doktorların müsait saat slotlarına göre canlı randevu seçimi ve onay takibi.
* **PDF Rapor Görüntüleyici:** Muayene sonuçlarını ve doktor tarafından yüklenen tıbbi raporları anında mobil cihazda görüntüleme/indirme.
* **Çoklu Dil ve RTL Desteği:** Arapça, Türkçe ve İngilizce dil seçenekleri ile sağdan sola (RTL) tam uyumlu arayüz.
* **AI Sağlık Asistanı:** Yapay zeka altyapılı kişisel sağlık danışmanı.
* **Destek & Bildirimler:** Randevu güncellemeleri, sonuç bildirimleri ve müşteri destek biletleri.

### 🩺 2. Doktor Paneli (Vue 3 + Vite + Leaflet)
* **Canlı Dashboard:** Günlük randevu yükü, bekleyen hasta sayısı ve performans grafikleri.
* **Gelişmiş Takvim ve Liste:** Randevuları günlük/haftalık bazda yönetme, durumu güncelleme (Tamamlandı, İptal, No-show).
* **Hasta Geçmişi Sorgulama:** Telefon numarası ile hasta geçmişi ve tıbbi kayıt sorgulama.
* **PDF Muayene Rapor Yükleme ve AI Analizi:** Muayene sonuçlarını PDF olarak yükleme ve otomatik rapor analizi yapma.
* **Çalışma Saatleri & Slot Yönetimi:** Esnek mesai saatleri ve randevu aralıkları belirleme.

### 🛡️ 3. SuperAdmin Paneli (Next.js 15)
* **Doktor Onay Sistemi:** Sisteme kaydolan yeni doktor başvurularını inceleme ve onaylama/reddetme.
* **Kullanıcı & Bloke Yönetimi:** Sistem genelindeki hastaları ve doktorları denetleme.
* **Destek Merkezi:** Hastalardan ve doktorlardan gelen yardım taleplerini yanıtlama ve çözümleme.

### ⚡ 4. Backend API & Veritabanı (Laravel 11 & PostgreSQL)
* **Çift Kimlik Doğrulama:** Sanctum tabanlı hasta (User) ve doktor (Doctor) token yönetimi.
* **Güvenlik & Rate Limiting:** Brute-force saldırılarına karşı OTP endpoint'lerinde özel IP/telefon kısıtlaması (`throttle: 5,1`).
* **PDF Servis Katmanı:** Base64 veya sunucu diskindeki tıbbi raporları doğrudan güvenli URL üzerinden sunma (`/api/reports/{id}`).

---

## 🛠️ Teknoloji Yığını (Tech Stack)

| Katman | Teknoloji / Kütüphane | Versiyon / Detay |
|---|---|---|
| **Backend API** | Laravel, PHP | Laravel 11 / PHP 8.2 |
| **Veritabanı** | PostgreSQL | PostgreSQL 16 |
| **Auth & Security** | Laravel Sanctum | Dual-Token (UUID / Phone OTP) |
| **Doktor Paneli** | Vue.js, Vite, TypeScript | Vue 3.5, Vite 5.4, Leaflet Maps |
| **Admin Paneli** | Next.js, TypeScript, Tailwind | Next.js 15, App Router |
| **Mobil Uygulama** | Flutter, Dart | Cross-Platform (iOS & Android) |
| **Bildirim & OTP** | Twilio API | WhatsApp & SMS OTP |

---

## 🌐 Temel API Endpoint'leri

### 🔓 Public Rotalar
* `POST /api/auth/send-otp` - Telefon numarasına OTP doğrulama kodu gönderir.
* `POST /api/auth/verify-otp` - OTP kodunu doğrular ve Sanctum token döner.
* `GET /api/doctors` - Uzmanlık ve filtreye göre doktorları listeler.
* `GET /api/doctors/{id}/schedule` - Doktorun müsait randevu slotlarını getirir.
* `GET /api/reports/{identifier}` - Muayene PDF raporunu görüntüler.

### 🔐 Hasta Rotaları (`auth:sanctum`)
* `POST /api/appointments` - Yeni randevu oluşturur.
* `GET /api/appointments/my-appointments` - Hastanın randevu geçmişini listeler.
* `GET /api/results` - Hastanın geçmiş muayene sonuçlarını getirir.
* `POST /api/support_tickets` - Destek talebi oluşturur.

### 🩺 Doktor Paneli Rotaları (`doctor-panel/*`)
* `POST /api/doctor-panel/auth/verify-otp` - Doktor OTP girişi.
* `GET /api/doctor-panel/dashboard` - Günlük istatistik ve randevu özetini getirir.
* `PUT /api/doctor-panel/schedule` - Çalışma saatlerini günceller.
* `POST /api/doctor-panel/analyze-report` - Yüklenen muayene raporunu yapay zeka ile analiz eder.

---

## 📄 Lisans

Bu proje **omartthr** tarafından geliştirilmiştir. Tüm hakları saklıdır.
