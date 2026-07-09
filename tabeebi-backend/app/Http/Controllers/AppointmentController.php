<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    /**
     * Bir doktorun belirli bir tarihteki dolu saatlerini getirir
     * Endpoint: /api/appointments/booked-times?doctor_id=...&date=YYYY-MM-DD
     */
    public function bookedTimes(Request $request)
    {
        $request->validate([
            'doctor_id' => 'required|uuid',
            'date' => 'required|date_format:Y-m-d'
        ]);

        // Sadece iptal edilmemiş olan dolu randevuların saatlerini çek
        $bookedTimes = Appointment::where('doctor_id', $request->doctor_id)
            ->where('date', $request->date)
            ->where('status', '!=', 'cancelled')
            ->pluck('time'); // Sadece 'time' kolonunu dizi olarak döndürür

        return response()->json($bookedTimes);
    }

    /**
     * Yeni bir randevu oluşturur
     * Endpoint: /api/appointments (POST)
     */
    public function store(Request $request)
    {
        $request->validate([
            'doctor_id' => 'required|uuid',
            'date' => 'required|date_format:Y-m-d',
            'time' => 'required|string',
            'payment' => 'required|string',
            'price' => 'nullable|numeric'
        ]);

        // Eğer hasta token ile login olmuşsa ID'sini request->user()'dan alırız
        $patientId = $request->user() ? $request->user()->id : null;

        $price = $request->price;
        if (!$price) {
            $doctor = \App\Models\Doctor::find($request->doctor_id);
            $price = $doctor ? $doctor->price : 0;
        }

        $appointment = Appointment::create([
            'patient_id'  => $patientId,
            'doctor_id'   => $request->doctor_id,
            'date'        => $request->date,
            'time'        => $request->time,
            'duration'    => $request->duration ?? 30,
            'reason'      => $request->reason,
            'notes'       => $request->notes,
            'payment'     => $request->payment,
            'clinic'      => $request->clinic,
            'price'       => $price,
            'status'      => 'pending',
        ]);

        // Randevu oluşturulduğunda WhatsApp'tan bilgi mesajı at (Twilio)
        $this->sendAppointmentWhatsApp($request, $appointment);

        return response()->json([
            'message' => 'Appointment created successfully',
            'appointment' => $appointment
        ], 201);
    }

    /**
     * Hastaya randevu oluşturulduğuna dair WhatsApp mesajı atar
     */
    private function sendAppointmentWhatsApp($request, $appointment)
    {
        try {
            $sid = env('TWILIO_SID');
            $token = env('TWILIO_AUTH_TOKEN');
            $twilioWhatsapp = env('TWILIO_WHATSAPP_NUMBER');
            
            // Hastanın telefon numarasını bul (Request'ten veya User'dan)
            $phone = $request->user() ? $request->user()->phone : $request->patient_phone;
            
            // Irak kodu sabitleme
            $phone = ltrim($phone, '+0');
            if (!str_starts_with($phone, '964')) {
                $phone = '964' . $phone;
            }

            if ($sid && $token && $twilioWhatsapp && $phone) {
                // Doktor adını bul (İlişkiden)
                $doctor = \App\Models\Doctor::find($appointment->doctor_id);
                $doctorName = $doctor ? $doctor->name : 'Doktor';
                
                $twilio = new \Twilio\Rest\Client($sid, $token);
                $to = 'whatsapp:+' . $phone;
                
                $messageBody = "Merhabalar! Tabeebi+ panelinden adiniza *Dr. {$doctorName}* ile *{$appointment->date}* gunu saat *{$appointment->time}* icin bir muayene randevusu olusturuldu.\n\nRandevunuzu takip etmek icin Tabeebi+ uygulamasini indirin ve {$phone} numaranizla giris yapin.\n\n📱 Uygulama Linki: https://tabeebi.plus/app";
                
                $twilio->messages->create($to, [
                    'from' => $twilioWhatsapp,
                    'body' => $messageBody
                ]);
            }
        } catch (\Exception $e) {
            \Log::error('Twilio WhatsApp Appointment Hatasi: ' . $e->getMessage());
        }
    }

    /**
     * Login olmuş hastanın kendi randevularını getirir
     * Endpoint: /api/appointments/my-appointments (GET)
     */
    public function myAppointments(Request $request)
    {
        // $request->user() Sanctum sayesinde Token'dan hastayı otomatik bulur
        $patientId = $request->user()->id;

        $appointments = Appointment::with('doctor')
            ->where('patient_id', $patientId)
            ->orderBy('date', 'desc')
            ->orderBy('time', 'desc')
            ->get();

        return response()->json($appointments);
    }

    /**
     * Yaklaşan ilk randevuyu getirir
     */
    public function nextAppointment(Request $request)
    {
        $patientId = $request->user()->id;

        $appointment = Appointment::with('doctor')
            ->where('patient_id', $patientId)
            ->where('date', '>=', date('Y-m-d'))
            ->where('status', '!=', 'cancelled')
            ->orderBy('date', 'asc')
            ->orderBy('time', 'asc')
            ->first();

        return response()->json($appointment);
    }

    /**
     * Randevu günceller (Örn: iptal etme)
     */
    public function update(Request $request, $id)
    {
        $appointment = Appointment::find($id);

        if (!$appointment) {
            return response()->json(['error' => 'Appointment not found'], 404);
        }

        // Sahiplik kontrolü: sadece kendi randevusunu güncelleyebilir
        $patientId = $request->user()?->id;
        if ($patientId && $appointment->patient_id !== $patientId) {
            return response()->json(['error' => 'Yetkisiz işlem'], 403);
        }

        // Sadece izin verilen alanlar güncellenebilir
        $appointment->update($request->only(['status', 'notes', 'rating', 'review']));

        return response()->json($appointment);
    }
}
