<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\PhoneOtp;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Hastayı telefon numarasıyla getirir
     */
    public function getPatient($phone)
    {
        $phone = ltrim($phone, '+0');
        if (!str_starts_with($phone, '964')) {
            $phone = '964' . $phone;
        }

        $patient = Patient::where('phone', $phone)->first();
        if (!$patient) {
            return response()->json(['error' => 'Patient not found'], 404);
        }
        return response()->json($patient);
    }

    /**
     * Giriş veya kayıt için OTP gönderir (Supabase signInWithOtp karşılığı)
     */
    public function sendOtp(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
        ]);

        $phone = $request->phone;
        // Irak Ülke Kodu Sabitleme (+964)
        $phone = ltrim($phone, '+0'); // Başındaki varsa 0 veya + işaretini at
        if (!str_starts_with($phone, '964')) {
            $phone = '964' . $phone;
        }

        // 4 haneli rastgele kod üret
        $code = (string) rand(1000, 9999); 
        // Test için konsola veya loga yazalım:
        \Log::info("OTP for $phone is $code");

        PhoneOtp::updateOrCreate(
            ['phone' => $phone],
            [
                'otp' => $code,
                'expires_at' => now()->addMinutes(10),
                'created_at' => now()
            ]
        );

        // Twilio WhatsApp (veya SMS) Entegrasyonu
        try {
            $sid = env('TWILIO_SID');
            $token = env('TWILIO_AUTH_TOKEN');
            $twilioWhatsapp = env('TWILIO_WHATSAPP_NUMBER'); // 'whatsapp:+14155238886'

            if ($sid && $token && $twilioWhatsapp) {
                $twilio = new \Twilio\Rest\Client($sid, $token);
                
                // Telefon numarasının başına whatsapp:+ ekliyoruz (Zaten 964 formatında)
                $to = 'whatsapp:+' . $phone;
                
                $twilio->messages->create($to, [
                    'from' => $twilioWhatsapp,
                    'body' => "Tabeebi+ doğrulama kodunuz: *" . $code . "*\n\nBu kod 10 dakika geçerlidir."
                ]);
                \Log::info("WhatsApp OTP sent via Twilio to $to");
            } else {
                \Log::warning('Twilio bilgileri .env dosyasinda eksik. SMS gonderilmedi, sadece loglandi.');
            }
        } catch (\Exception $e) {
            \Log::error('Twilio SMS Hatasi: ' . $e->getMessage());
        }

        return response()->json([
            'message'    => 'OTP sent successfully',
            'expires_in' => '10 minutes',
        ]);
    }

    /**
     * OTP doğrular ve Token üretir
     */
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
            'code' => 'required|string',
        ]);

        $phone = $request->phone;
        $phone = ltrim($phone, '+0');
        if (!str_starts_with($phone, '964')) {
            $phone = '964' . $phone;
        }

        \Log::info("Verifying OTP for phone: $phone. Provided code: {$request->code}");
        \Log::info("Current DB Records: " . json_encode(PhoneOtp::all()));

        $otpRecord = PhoneOtp::where('phone', $phone)->first();

        if (!$otpRecord) {
            \Log::error("OTP Record NOT FOUND for $phone");
            return response()->json(['error' => 'Invalid OTP code - record not found'], 400);
        }
        
        if ($otpRecord->otp !== $request->code) {
            \Log::error("OTP Mismatch! DB: {$otpRecord->otp}, Req: {$request->code}");
            return response()->json(['error' => 'Invalid OTP code - mismatch'], 400);
        }

        if (now()->isAfter($otpRecord->expires_at)) {
            return response()->json(['error' => 'OTP expired'], 400);
        }

        // Doğrulandı, kod silinir
        $otpRecord->delete();
        \Log::info("OTP deleted for $phone. Creating/finding patient...");

        try {
            // Hastayı bul veya yeni kayıt oluştur
            $patient = Patient::firstOrCreate(
                ['phone' => $phone],
                [
                    'name' => 'User ' . substr($phone, -4),
                    'avatar_hue' => rand(0, 360)
                ]
            );
            \Log::info("Patient found/created: ID={$patient->id}, phone={$patient->phone}");
        } catch (\Exception $e) {
            \Log::error("PATIENT CREATE FAILED: " . $e->getMessage());
            return response()->json(['error' => 'Patient save error: ' . $e->getMessage()], 500);
        }

        try {
            // Sanctum API Token oluştur
            \Log::info("Creating token for patient ID: {$patient->id}");
            $token = $patient->createToken('auth_token')->plainTextToken;
            \Log::info("Token created successfully!");
        } catch (\Exception $e) {
            \Log::error("TOKEN CREATE FAILED: " . $e->getMessage());
            return response()->json(['error' => 'Token error: ' . $e->getMessage()], 500);
        }

        return response()->json([
            'patient' => $patient,
            'token' => $token
        ]);
    }

    /**
     * Yeni Kullanıcı Kaydı (Kayıt olup hemen ardından OTP gönderir)
     */
    public function register(Request $request)
    {
        $phone = $request->phone;
        $phone = ltrim($phone, '+0');
        if (!str_starts_with($phone, '964')) {
            $phone = '964' . $phone;
        }
        
        $request->merge(['phone' => $phone]);

        $request->validate([
            'phone' => 'required|string|unique:patients,phone',
            'name' => 'required|string'
        ]);

        // Hasta kaydı oluştur
        $patient = Patient::create([
            'phone' => $request->phone,
            'name' => $request->name,
            'avatar_hue' => rand(0, 360),
            'is_registered' => true
        ]);

        // Kayıt başarılıysa hemen OTP Gönder
        return $this->sendOtp($request);
    }

    /**
     * Mevcut Kullanıcı Bilgilerini Getirir (me)
     */
    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}
