# Tabeebi+ — Proje Yapısı

Klinik Randevu Sistemi | Mart 2026 | v1.3

---

## Genel Bakış

| Modül | Teknoloji | Açıklama | Port |
|-------|-----------|----------|------|
| `backend/` | Node.js + Express | RESTful API sunucusu | :5000 |
| `doctor-panel/` | Next.js + TypeScript + Tailwind | Doktor yönetim paneli (Web) | :3000 |
| `admin-panel/` | Next.js + TypeScript + Tailwind | SuperAdmin yönetim paneli (Web) | :3001 |
| `mobile/` | React Native | Hasta mobil uygulaması (iOS + Android) | — |

---

## Kullanıcı Rolleri

| Rol | Yetki | Arayüz |
|-----|-------|--------|
| **Hasta (User)** | Kayıt, randevu alma, sonuç görüntüleme, değerlendirme, yardım merkezi | Mobil uygulama |
| **Doktor (Admin)** | Randevu yönetimi, muayene sonucu girme, mesai düzenleme, hasta bloke etme | Doctor panel (Web) |
| **SuperAdmin** | Doktor onaylama, bloke kaldırma, yardım merkezi yönetimi, sistem denetimi | Admin panel (Web) |

---

## Klasör Yapısı

```
tabeebi+/
│
├── backend/                            → API SUNUCUSU
│   ├── .env.example                    → Ortam değişkenleri şablonu
│   ├── package.json
│   └── src/
│       ├── app.js                      → Express uygulama kurulumu
│       ├── server.js                   → Sunucu başlatma
│       ├── config/                     → Firebase, DB, Redis yapılandırma
│       ├── controllers/                → İş mantığı
│       │   ├── auth.controller.js      → Kayıt + OTP doğrulama
│       │   ├── appointment.controller.js → Randevu oluşturma/iptal/onay
│       │   ├── doctor.controller.js    → Doktor listeleme, detay, slot
│       │   ├── specialty.controller.js → Uzmanlık alanları
│       │   ├── result.controller.js    → Muayene sonuçları
│       │   ├── review.controller.js    → 5 yıldız + yorum değerlendirme
│       │   ├── support.controller.js   → Yardım merkezi talepleri
│       │   ├── notification.controller.js → Bildirim yönetimi
│       │   └── payment.controller.js   → Ödeme işlemleri
│       ├── routes/                     → API endpoint tanımları
│       │   ├── index.js                → Tüm route'ları birleştirir
│       │   ├── auth.routes.js          → /api/auth/*
│       │   ├── appointment.routes.js   → /api/appointments/*
│       │   ├── doctor.routes.js        → /api/doctors/*
│       │   ├── specialty.routes.js     → /api/specialties
│       │   ├── result.routes.js        → /api/users/me/results/*
│       │   ├── review.routes.js        → /api/reviews
│       │   ├── support.routes.js       → /api/support/*
│       │   ├── notification.routes.js  → Bildirim endpoint'leri
│       │   └── payment.routes.js       → Ödeme endpoint'leri
│       ├── models/                     → Veri modelleri (Firestore/PostgreSQL)
│       │   ├── user.model.js           → id, name, phone, role, isBlocked
│       │   ├── doctor.model.js         → id, name, specialty, location, price, workingHours
│       │   ├── appointment.model.js    → id, userId, doctorId, date, time, status
│       │   ├── specialty.model.js      → id, name, icon, description
│       │   ├── result.model.js         → id, diagnosis, prescription, notes, files
│       │   ├── review.model.js         → id, rating, comment
│       │   ├── notification.model.js   → id, type, title, body, isRead
│       │   └── supportRequest.model.js → id, reason, message, status, adminResponse
│       ├── middleware/                  → Ara katman yazılımları
│       │   ├── auth.middleware.js       → JWT token doğrulama
│       │   ├── role.middleware.js       → RBAC: User / Doctor / SuperAdmin
│       │   └── rateLimiter.middleware.js → Brute-force koruması
│       ├── services/                   → Harici servis entegrasyonları
│       │   ├── firebase.service.js     → Firebase Admin SDK
│       │   ├── otp.service.js          → SMS gönderimi (Twilio/Netgsm)
│       │   ├── notification.service.js → FCM push bildirim
│       │   ├── payment.service.js      → iyzico/Stripe ödeme
│       │   └── storage.service.js      → Firebase Storage dosya yükleme
│       ├── validators/                 → Giriş doğrulama kuralları
│       │   ├── auth.validator.js
│       │   └── appointment.validator.js
│       └── utils/                      → Yardımcı fonksiyonlar
│           ├── helpers.js
│           └── constants.js            → Roller, durumlar, bildirim türleri
│
├── doctor-panel/                       → DOKTOR WEB PANELİ
│   ├── package.json
│   └── src/
│       ├── app/                        → Next.js App Router sayfaları
│       │   ├── layout.tsx              → Ana layout
│       │   ├── page.tsx                → Ana sayfa → dashboard yönlendirme
│       │   ├── (auth)/login/page.tsx   → Doktor giriş (2FA zorunlu)
│       │   ├── dashboard/page.tsx      → Günlük randevular, özet istatistik
│       │   ├── appointments/page.tsx   → Randevu listesi ve yönetimi
│       │   ├── patients/page.tsx       → Hasta listesi, no-show bloke etme
│       │   ├── results/page.tsx        → Muayene sonucu girme ve paylaşma
│       │   ├── schedule/page.tsx       → Mesai saatleri düzenleme
│       │   ├── profile/page.tsx        → Doktor profil yönetimi
│       │   └── statistics/page.tsx     → İstatistikler ve raporlar
│       ├── components/
│       │   ├── layout/                 → Sidebar, Header
│       │   ├── ui/                     → Genel UI bileşenleri
│       │   ├── appointments/           → AppointmentCard, AppointmentList
│       │   ├── patients/               → PatientCard
│       │   ├── results/                → ResultForm
│       │   └── schedule/               → WeeklySchedule
│       ├── lib/                        → firebase.ts, api.ts
│       ├── hooks/                      → useAuth, useAppointments
│       ├── services/                   → appointment, patient, result API servisleri
│       ├── store/                      → authStore (state yönetimi)
│       ├── types/                      → TypeScript tip tanımlamaları
│       └── styles/                     → globals.css (Tailwind)
│
├── admin-panel/                        → SUPERADMIN YÖNETİM PANELİ
│   ├── package.json
│   └── src/
│       ├── app/                        → Next.js App Router sayfaları
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   ├── (auth)/login/page.tsx   → SuperAdmin giriş
│       │   ├── dashboard/page.tsx      → Sistem geneli özet
│       │   ├── doctors/
│       │   │   ├── pending/page.tsx    → Onay bekleyen doktor başvuruları
│       │   │   └── approved/page.tsx   → Onaylanmış doktor listesi
│       │   ├── support/page.tsx        → Yardım merkezi talepleri (bloke kaldırma dahil)
│       │   └── users/page.tsx          → Kullanıcı listesi ve bloke yönetimi
│       ├── components/
│       │   ├── layout/                 → Sidebar, Header
│       │   ├── doctors/                → DoctorApplicationCard
│       │   └── support/                → SupportRequestCard
│       ├── lib/                        → firebase.ts, api.ts
│       ├── hooks/                      → useAuth
│       ├── services/                   → doctor, support, user API servisleri
│       ├── store/                      → authStore
│       └── types/                      → TypeScript tip tanımlamaları
│
├── mobile/                             → HASTA MOBİL UYGULAMASI
│   ├── package.json
│   ├── app.json
│   ├── android/                        → Android native dosyaları
│   ├── ios/                            → iOS native dosyaları
│   └── src/
│       ├── App.tsx                     → Ana giriş bileşeni
│       ├── screens/                    → Ekranlar
│       │   ├── auth/
│       │   │   ├── LoginScreen.tsx     → İsim + telefon ile kayıt/giriş
│       │   │   └── OTPScreen.tsx       → SMS OTP doğrulama
│       │   ├── home/
│       │   │   └── HomeScreen.tsx      → Hastalık kategori kartları (arama yok)
│       │   ├── doctors/
│       │   │   ├── DoctorListScreen.tsx    → Kategoriye göre doktor listesi
│       │   │   └── DoctorDetailScreen.tsx  → Konum, fiyat, mesai, değerlendirmeler
│       │   ├── appointments/
│       │   │   ├── BookingScreen.tsx       → Boş saat seçimi + randevu oluşturma
│       │   │   ├── PaymentScreen.tsx       → Ödeme yöntemi (online/nakit)
│       │   │   ├── MyAppointmentsScreen.tsx → Aktif ve geçmiş randevular
│       │   │   └── AppointmentDetailScreen.tsx → Randevu detayı
│       │   ├── results/
│       │   │   ├── MyResultsScreen.tsx     → Tüm geçmiş muayene sonuçları
│       │   │   └── ResultDetailScreen.tsx  → Teşhis, reçete, dosyalar
│       │   ├── profile/
│       │   │   └── ProfileScreen.tsx       → Hasta profil yönetimi
│       │   ├── support/
│       │   │   └── SupportScreen.tsx       → Yardım merkezi (bloke kaldırma + sorular)
│       │   └── notifications/
│       │       └── NotificationsScreen.tsx → Bildirim geçmişi
│       ├── components/
│       │   ├── common/                → Button, Input, Card, Loading
│       │   ├── doctors/               → DoctorCard, SpecialtyCard, SlotPicker
│       │   ├── appointments/          → AppointmentCard
│       │   ├── results/               → ResultCard
│       │   └── reviews/               → ReviewForm, StarRating
│       ├── navigation/
│       │   ├── AppNavigator.tsx        → Ana navigasyon (Auth vs Main)
│       │   ├── AuthNavigator.tsx       → Login → OTP akışı
│       │   └── MainTabNavigator.tsx    → Alt tab bar (4 tab)
│       ├── services/                   → API çağrıları (7 servis)
│       ├── store/                      → authStore, appointmentStore
│       ├── hooks/                      → useAuth, useNotifications
│       ├── config/                     → Firebase yapılandırması
│       ├── types/                      → TypeScript tip tanımlamaları
│       ├── utils/                      → helpers, constants
│       ├── styles/                     → theme (renkler, fontlar, spacing)
│       └── assets/                     → icons/, images/
│
├── package.json                        → Monorepo root (workspaces)
└── .gitignore
```

---

## API Endpoint'leri

| Metot | Endpoint | Açıklama | Yetki |
|-------|----------|----------|-------|
| POST | `/api/auth/register` | Yeni hasta kayıt | Public |
| POST | `/api/auth/verify-otp` | OTP doğrulama | Public |
| GET | `/api/specialties` | Uzmanlık listesi | User |
| GET | `/api/doctors?specialty=X` | Kategoriye göre doktorlar | User |
| GET | `/api/doctors/:id` | Doktor detay + mesai | User |
| GET | `/api/doctors/:id/slots` | Boş randevu saatleri | User |
| POST | `/api/appointments` | Randevu oluştur | User |
| PATCH | `/api/appointments/:id/confirm` | Hatırlatma onayı | User |
| PATCH | `/api/appointments/:id/cancel` | Randevu iptali | User |
| POST | `/api/appointments/:id/result` | Muayene sonucu gir | Doctor |
| GET | `/api/users/me/results` | Hasta tüm sonuç geçmişi | User |
| GET | `/api/users/me/results/:id` | Tek sonuç detayı | User |
| POST | `/api/reviews` | Değerlendirme yap | User |
| POST | `/api/doctors/apply` | Doktor başvurusu | Public |
| PATCH | `/api/doctors/:id/approve` | Yeni doktor onayı | SuperAdmin |
| PATCH | `/api/users/:id/block` | Hasta bloke (no-show) | Doctor |
| POST | `/api/support/request` | Yardım merkezi talebi | User |
| PATCH | `/api/support/:id/resolve` | Talebi değerlendir / bloke kaldır | SuperAdmin |
| GET | `/api/doctor/dashboard` | Dashboard istatistikleri | Doctor |

---

## Veritabanı Tabloları

| Tablo | Ana Alanlar |
|-------|-------------|
| `users` | id, name, phone, role, isBlocked, blockReason, createdAt |
| `doctors` | id, name, specialty, location, price, workingHours, rating, isApproved, documents |
| `appointments` | id, userId, doctorId, date, time, status, paymentType, paymentStatus |
| `specialties` | id, name, icon, description |
| `reviews` | id, userId, doctorId, appointmentId, rating, comment, createdAt |
| `results` | id, appointmentId, doctorId, userId, diagnosis, prescription, notes, files, createdAt |
| `notifications` | id, userId, type, title, body, isRead, createdAt |
| `support_requests` | id, userId, reason, message, status, adminResponse, createdAt, resolvedAt |

---

## Teknoloji Stack

| Katman | Teknoloji |
|--------|-----------|
| Mobil (Hasta) | React Native |
| Doktor Panel | Next.js + TypeScript + Tailwind CSS |
| Admin Panel | Next.js + TypeScript + Tailwind CSS |
| Backend API | Node.js + Express |
| Veritabanı | Firestore / PostgreSQL |
| Cache | Redis |
| Auth | Firebase Auth + JWT |
| Bildirimler | FCM + Twilio/Netgsm |
| Ödeme | iyzico / Stripe |
| Harita | Google Maps API / Leaflet.js |
| Dosya Depolama | Firebase Storage |
| Deployment | Vercel + Firebase Hosting |

---

## Geliştirme Öncelik Sırası

1. Authentication ve kullanıcı yönetimi
2. Kategori bazlı doktor listeleme ve randevu sistemi
3. Ödeme entegrasyonu
4. Bildirim sistemi
5. Muayene sonuç paylaşımı ve geçmiş kaydı
6. Değerlendirme ve öneri algoritması
7. Doktor paneli ve yardım merkezi
8. SuperAdmin paneli (doktor onay + bloke yönetimi)
