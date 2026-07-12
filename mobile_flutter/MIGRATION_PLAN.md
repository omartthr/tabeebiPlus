# Tabeebi Mobile Flutter Migration Plan

Source app: `../mobile`
Target app: `./mobile_flutter`

Rule: do not edit or delete the React Native `mobile/` app while migrating.

## Current React Native Inventory

- Root flow: splash -> RTL provider -> auth session check -> auth stack or main stack.
- Auth stack: Welcome, Register, Login, OTP.
- Main tabs: Home, Appointments, AI Chat, Results, Profile.
- Extra stack screens: DoctorList, DoctorDetail, Booking, Confirmed, Help, Privacy.
- Shared layers: theme tokens, static demo data, API client, auth context, RTL/i18n context, common cards and badges.
- Live API base URL: `https://tabeebiplus-production.up.railway.app/api`.

## Migration Order

1. Foundation
   - Theme tokens, models, demo data, date helpers.
   - API client and repository classes.
   - Local auth/session storage.
   - App shell, navigation, bottom tab bar.

2. Auth
   - Welcome with language selector.
   - Login and Register phone forms.
   - OTP verification and session restore.

3. Home And Tabs
   - Home header, AI card, upcoming appointment card, specialties grid.
   - Bottom navigation matching the RN glass tab style.

4. Doctors
   - Specialty -> doctor list.
   - Doctor card, details, schedule fetch.

5. Appointments
   - Booking flow, booked times, create appointment.
   - Upcoming/past appointments, cancel, reschedule, rating modal.

6. Results, Notifications, Profile, Support
   - Patient results and notifications.
   - Profile stats, language switch, privacy/delete account.
   - Support tickets and ticket creation.

7. Polish
   - RTL for Arabic/Kurdish.
   - Assets, splash, icon, release build.
   - QA on real Android device with hot reload and APK build.

## First Ported Foundation

- `lib/core/theme/app_colors.dart`
- `lib/data/models/tabeebi_models.dart`
- `lib/data/repositories/demo_data.dart`
- `lib/core/network/tabeebi_api_client.dart`
- `lib/core/utils/date_utils.dart`

