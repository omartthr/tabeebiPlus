<?php

namespace App\Http\Controllers;

use App\Models\DoctorRegistration;
use App\Models\PhoneOtp;
use Illuminate\Http\Request;

class DoctorAuthController extends Controller
{
    // ─── Yardımcı: telefon numarasını normalize et ────────────────────────────
    private function normalizePhone(string $phone): string
    {
        $phone = preg_replace('/\s+/', '', ltrim($phone, '+0 '));
        if (!str_starts_with($phone, '964') && !str_starts_with($phone, '90')) {
            $phone = '964' . $phone;
        }
        return $phone;
    }

    // ─── POST /api/doctor-panel/auth/send-otp ────────────────────────────────
    public function sendOtp(Request $request)
    {
        $request->validate(['phone' => 'required|string']);

        $phone = $this->normalizePhone($request->phone);
        $code  = (string) rand(1000, 9999);

        \Log::info("Doctor OTP for $phone: $code");

        PhoneOtp::updateOrCreate(
            ['phone' => $phone],
            ['otp' => $code, 'expires_at' => now()->addMinutes(10), 'created_at' => now()]
        );

        try {
            $sid   = env('TWILIO_SID');
            $token = env('TWILIO_AUTH_TOKEN');
            $from  = env('TWILIO_WHATSAPP_NUMBER');

            if ($sid && $token && $from) {
                $twilio = new \Twilio\Rest\Client($sid, $token);
                $twilio->messages->create("whatsapp:+{$phone}", [
                    'from' => $from,
                    'body' => "Tabeebi+ Doktor Paneli doğrulama kodunuz: *{$code}*\n\nBu kod 10 dakika geçerlidir.",
                ]);
            }
        } catch (\Exception $e) {
            \Log::error('Doctor OTP Twilio Error: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'OTP gönderildi',
        ]);
    }

    // ─── POST /api/doctor-panel/auth/verify-otp ──────────────────────────────
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
            'code'  => 'required|string',
        ]);

        $phone     = $this->normalizePhone($request->phone);
        $otpRecord = PhoneOtp::where('phone', $phone)->first();

        if (!$otpRecord || $otpRecord->otp !== $request->code) {
            return response()->json(['error' => 'Kod hatalı veya bulunamadı'], 400);
        }

        if (now()->isAfter($otpRecord->expires_at)) {
            $otpRecord->delete();
            return response()->json(['error' => 'Kodun süresi dolmuş'], 400);
        }

        $otpRecord->delete();

        // Doktor daha önce kayıtlı mı?
        $doctor = DoctorRegistration::where('phone', $phone)->first();

        if ($doctor) {
            $token = $doctor->createToken('doctor_panel')->plainTextToken;

            return response()->json([
                'valid'  => true,
                'token'  => $token,
                'doctor' => [
                    'id'          => $doctor->id,
                    'name'        => $doctor->name,
                    'surname'     => $doctor->surname,
                    'specialty'   => $doctor->specialty,
                    'status'      => $doctor->status,
                    'doctors_id'  => $doctor->doctors_id,
                    'clinic_name' => $doctor->clinic_name,
                ],
            ]);
        }

        // Yeni doktor: kayıt formuna yönlendirilecek, token henüz yok
        return response()->json(['valid' => true, 'doctor' => null]);
    }

    // ─── GET /api/doctor-panel/auth/check?phone= ─────────────────────────────
    public function checkDoctor(Request $request)
    {
        $request->validate(['phone' => 'required|string']);
        $phone  = $this->normalizePhone($request->phone);
        $doctor = DoctorRegistration::where('phone', $phone)->first();

        if (!$doctor) {
            return response()->json(null, 404);
        }

        return response()->json([
            'id'        => $doctor->id,
            'name'      => $doctor->name,
            'surname'   => $doctor->surname,
            'specialty' => $doctor->specialty,
            'status'    => $doctor->status,
        ]);
    }

    // ─── POST /api/doctor-panel/auth/register ────────────────────────────────
    public function register(Request $request)
    {
        $request->validate([
            'phone'     => 'required|string',
            'name'      => 'required|string',
            'surname'   => 'required|string',
            'specialty' => 'required|string',
        ]);

        $phone = $this->normalizePhone($request->phone);

        if (DoctorRegistration::where('phone', $phone)->exists()) {
            return response()->json(['error' => 'Bu numara ile kayıtlı bir doktor zaten mevcut'], 409);
        }

        $doctor = DoctorRegistration::create([
            'phone'            => $phone,
            'name'             => $request->name,
            'surname'          => $request->surname,
            'specialty'        => $request->specialty,
            'clinic_name'      => $request->clinic_name,
            'birth_date'       => $request->birth_date,
            'location_address' => $request->location_address,
            'location_lat'     => $request->location_lat,
            'location_lng'     => $request->location_lng,
            'status'           => 'pending',
        ]);

        // Başvuru alındı WhatsApp bildirimi (arka planda)
        $this->sendRegistrationWhatsApp($phone, $request->name, 'received');

        $token = $doctor->createToken('doctor_panel')->plainTextToken;

        return response()->json([
            'id'    => $doctor->id,
            'token' => $token,
        ], 201);
    }

    // ─── Yardımcı: kayıt WhatsApp bildirimi ──────────────────────────────────
    private function sendRegistrationWhatsApp(string $phone, string $name, string $type): void
    {
        try {
            $sid   = env('TWILIO_SID');
            $token = env('TWILIO_AUTH_TOKEN');
            $from  = env('TWILIO_WHATSAPP_NUMBER');

            if (!$sid || !$token || !$from) return;

            $messages = [
                'received' => "Merhaba Dr. {$name}! 👨‍⚕️\n\nTabeebi+ doktor başvurunuz alındı. Ekibimiz bilgilerinizi incelediğinde size bildirim göndereceğiz.\n\n— Tabeebi+ Ekibi",
                'approved' => "Tebrikler Dr. {$name}! 🎉\n\nTabeebi+ doktor paneliniz onaylandı. Artık giriş yapabilirsiniz.",
            ];

            $twilio = new \Twilio\Rest\Client($sid, $token);
            $twilio->messages->create("whatsapp:+{$phone}", [
                'from' => $from,
                'body' => $messages[$type] ?? "Tabeebi+ başvurunuz güncellendi.",
            ]);
        } catch (\Exception $e) {
            \Log::error('Doctor Registration WhatsApp Error: ' . $e->getMessage());
        }
    }
}
