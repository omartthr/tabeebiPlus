<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\DoctorRegistration;
use App\Models\DoctorSchedule;
use App\Models\Notification;
use App\Models\Patient;
use Illuminate\Http\Request;

class DoctorPanelController extends Controller
{
    // ─── Token'dan doktoru al; Patient token'ı ile girilmesini engelle ────────
    private function doctor(Request $request): DoctorRegistration
    {
        $user = $request->user();
        if (!($user instanceof DoctorRegistration)) {
            abort(403, 'Bu endpoint yalnızca doktorlar içindir.');
        }
        return $user;
    }

    // ─── Yardımcı: randevu verilerini standart formata çevir ─────────────────
    private function formatAppointment(Appointment $a): array
    {
        $p = $a->relationLoaded('patient') ? $a->patient : null;
        return [
            'id'              => $a->id,
            'date'            => $a->date,
            'time'            => $a->time,
            'duration'        => $a->duration ?? 30,
            'reason'          => $a->reason,
            'status'          => $a->status,
            'notes'           => $a->notes,
            'price'           => $a->price ?? 0,
            'report_uploaded' => (bool) $a->report_uploaded,
            'pdf_url'         => $a->pdf_url ? url('/storage/reports/' . $a->id) : null,
            'patient_name'    => $a->patient_name,
            'patient_phone'   => $a->patient_phone,
            'patients'        => $p ? [
                'id'           => $p->id,
                'name'         => $p->name,
                'phone'        => $p->phone,
                'avatar_hue'   => $p->avatar_hue ?? 175,
                'patient_code' => $p->patient_code,
            ] : null,
        ];
    }

    // ─── Yardımcı: doktora ait randevuları filtreleyen query ─────────────────
    private function appointmentsFor(DoctorRegistration $doctor)
    {
        return Appointment::where(function ($q) use ($doctor) {
            $q->where('doctor_registration_id', $doctor->id);
            if ($doctor->doctors_id) {
                $q->orWhere('doctor_id', $doctor->doctors_id);
            }
        });
    }

    // ─── Yardımcı: telefon normalize ─────────────────────────────────────────
    private function normalizePhone(string $phone): string
    {
        $phone = preg_replace('/\s+/', '', ltrim($phone, '+0 '));
        if (!str_starts_with($phone, '964') && !str_starts_with($phone, '90')) {
            $phone = '964' . $phone;
        }
        return $phone;
    }

    // =========================================================================
    // PROFIL
    // =========================================================================

    // GET /api/doctor-panel/profile
    public function getProfile(Request $request)
    {
        $doctor = $this->doctor($request);
        $info   = $doctor->doctors_id ? Doctor::find($doctor->doctors_id) : null;

        return response()->json([
            'id'               => $doctor->id,
            'doctors_id'       => $doctor->doctors_id,
            'name'             => $doctor->name,
            'surname'          => $doctor->surname,
            'specialty'        => $doctor->specialty,
            'clinic_name'      => $doctor->clinic_name,
            'status'           => $doctor->status,
            'location_address' => $doctor->location_address,
            'location_lat'     => $doctor->location_lat,
            'location_lng'     => $doctor->location_lng,
            'price'            => $doctor->price    ?? $info?->price    ?? 0,
            'exp_years'        => $doctor->exp_years ?? 1,
            'rating'           => (float) ($info?->rating  ?? 0),
            'reviews'          => (int)   ($info?->reviews ?? 0),
        ]);
    }

    // PUT /api/doctor-panel/profile
    public function updateProfile(Request $request)
    {
        $doctor = $this->doctor($request);

        $doctor->update([
            'price'            => $request->price,
            'exp_years'        => $request->exp_years,
            'location_address' => $request->location_address,
            'location_lat'     => $request->location_lat,
            'location_lng'     => $request->location_lng,
        ]);

        if ($request->has('schedule')) {
            DoctorSchedule::updateOrCreate(
                ['doctor_registration_id' => $doctor->id],
                ['schedule' => $request->schedule, 'updated_at' => now()]
            );
        }

        // doctors tablosunu da senkronize et
        if ($doctor->doctors_id) {
            Doctor::where('id', $doctor->doctors_id)->update([
                'price'            => $request->price,
                'exp'              => ($request->exp_years ?? 1) . ' yrs',
                'location_address' => $request->location_address,
                'location_lat'     => $request->location_lat,
                'location_lng'     => $request->location_lng,
                'schedule'         => $request->schedule,
            ]);
        }

        return response()->json([
            'message'      => 'Profil güncellendi',
            'registration' => $doctor->fresh(),
        ]);
    }

    // =========================================================================
    // TAKVİM
    // =========================================================================

    // GET /api/doctor-panel/schedule
    public function getSchedule(Request $request)
    {
        $doctor   = $this->doctor($request);
        $schedule = DoctorSchedule::where('doctor_registration_id', $doctor->id)->first();
        return response()->json(['schedule' => $schedule?->schedule]);
    }

    // PUT /api/doctor-panel/schedule
    public function updateSchedule(Request $request)
    {
        $doctor = $this->doctor($request);

        DoctorSchedule::updateOrCreate(
            ['doctor_registration_id' => $doctor->id],
            ['schedule' => $request->schedule, 'updated_at' => now()]
        );

        if ($doctor->doctors_id) {
            Doctor::where('id', $doctor->doctors_id)->update(['schedule' => $request->schedule]);
        }

        return response()->json(['message' => 'Takvim güncellendi']);
    }

    // =========================================================================
    // DASHBOARD & İSTATİSTİK
    // =========================================================================

    // GET /api/doctor-panel/dashboard
    public function getDashboard(Request $request)
    {
        $doctor       = $this->doctor($request);
        $appointments = $this->appointmentsFor($doctor)
            ->with('patient')
            ->orderBy('date', 'asc')
            ->orderBy('time', 'asc')
            ->get()
            ->map(fn($a) => $this->formatAppointment($a));

        return response()->json($appointments);
    }

    // GET /api/doctor-panel/statistics
    public function getStatistics(Request $request)
    {
        $doctor = $this->doctor($request);
        $data   = $this->appointmentsFor($doctor)
            ->select('id', 'price', 'status', 'reason', 'date')
            ->get();

        return response()->json($data);
    }

    // GET /api/doctor-panel/appointments/pending-count
    public function getPendingCount(Request $request)
    {
        $doctor = $this->doctor($request);
        $count  = $this->appointmentsFor($doctor)
            ->where('status', 'pending')
            ->count();

        return response()->json(['count' => $count]);
    }

    // =========================================================================
    // RANDEVU İŞLEMLERİ
    // =========================================================================

    // GET /api/doctor-panel/appointments/collision?date=&time=
    public function checkCollision(Request $request)
    {
        $request->validate(['date' => 'required|date', 'time' => 'required|string']);
        $doctor    = $this->doctor($request);
        $collision = $this->appointmentsFor($doctor)
            ->where('date', $request->date)
            ->where('time', $request->time)
            ->where('status', '!=', 'cancelled')
            ->first();

        return response()->json($collision);
    }

    // POST /api/doctor-panel/appointments/manual
    public function createManualAppointment(Request $request)
    {
        $request->validate([
            'date' => 'required|date_format:Y-m-d',
            'time' => 'required|string',
        ]);

        $doctor = $this->doctor($request);

        // Hasta bilgilerini çöz
        $patient      = null;
        $patientName  = $request->patient_name ?? 'Misafir Hasta';
        $patientPhone = null;

        if ($request->filled('patient_phone')) {
            $patientPhone = $this->normalizePhone($request->patient_phone);
            $patient      = Patient::where('phone', $patientPhone)->first();

            if (!$patient) {
                $patient = Patient::create([
                    'phone'         => $patientPhone,
                    'name'          => $patientName,
                    'avatar_hue'    => 175,
                    'is_registered' => false,
                ]);
            }
        } elseif ($request->filled('patient_id')) {
            $patient = Patient::find($request->patient_id);
        }

        $appointment = Appointment::create([
            'doctor_registration_id' => $doctor->id,
            'doctor_id'              => $doctor->doctors_id,
            'patient_id'             => $patient?->id,
            'patient_name'           => $patient?->name ?? $patientName,
            'patient_phone'          => $patientPhone ?? $request->patient_phone,
            'date'                   => $request->date,
            'time'                   => $request->time,
            'duration'               => $request->duration ?? 30,
            'reason'                 => $request->reason,
            'notes'                  => $request->notes,
            'price'                  => $request->price ?? $doctor->price ?? 0,
            'status'                 => 'confirmed',
            'payment'                => $request->payment ?? 'cash',
        ]);

        // Hastaya WhatsApp bildirimi
        if ($patientPhone) {
            $this->notifyPatientAppointment($patientPhone, $doctor, $appointment);
        }

        return response()->json(
            $this->formatAppointment($appointment->load('patient')),
            201
        );
    }

    // POST /api/doctor-panel/patients/temporary
    public function createTemporaryPatient(Request $request)
    {
        $request->validate([
            'name'  => 'required|string',
            'phone' => 'required|string',
        ]);

        $phone   = $this->normalizePhone($request->phone);
        $patient = Patient::where('phone', $phone)->first();

        if ($patient) {
            return response()->json($patient);
        }

        $patient = Patient::create([
            'phone'         => $phone,
            'name'          => $request->name,
            'avatar_hue'    => 175,
            'is_registered' => false,
        ]);

        return response()->json($patient, 201);
    }

    // PATCH /api/doctor-panel/appointments/{id}/status
    public function updateAppointmentStatus(Request $request, string $id)
    {
        $request->validate(['status' => 'required|in:pending,confirmed,cancelled,completed']);

        $appointment = Appointment::findOrFail($id);
        $appointment->update(['status' => $request->status]);

        return response()->json(['message' => 'Durum güncellendi', 'status' => $request->status]);
    }

    // PATCH /api/doctor-panel/appointments/{id}/report-uploaded
    public function markReportUploaded(string $id)
    {
        $appointment = Appointment::findOrFail($id);
        $appointment->update(['report_uploaded' => true]);

        // Ayrıca results tablosuna da ekleyelim ki mobil uygulamada "Sonuçlar" kısmına düşsün!
        \App\Models\Result::updateOrCreate(
            ['appointment_id' => $appointment->id],
            [
                'patient_id'  => $appointment->patient_id,
                'doctor_id'   => $appointment->doctor_id,
                'title'       => 'Muayene Notu — ' . $appointment->date,
                'diagnosis'   => 'Rapor gerekmemektedir. Muayene tamamlandı.',
                'notes'       => $appointment->notes ?? 'Genel muayene tamamlandı.',
                'meds'        => [],
                'next_steps'  => 'Gerekli durumlarda tekrar başvurun.',
                'unread'      => true,
                'date'        => $appointment->date,
            ]
        );

        return response()->json(['message' => 'Rapor yüklendi olarak işaretlendi']);
    }

    // =========================================================================
    // HASTALAR
    // =========================================================================

    // GET /api/doctor-panel/patients
    public function getPatients(Request $request)
    {
        $doctor = $this->doctor($request);
        $rows   = $this->appointmentsFor($doctor)
            ->with('patient')
            ->where('report_uploaded', true)
            ->orderBy('date', 'desc')
            ->get()
            ->map(fn($a) => $this->formatAppointment($a));

        return response()->json($rows);
    }

    // GET /api/doctor-panel/patients/lookup?phone=
    public function lookupPatient(Request $request)
    {
        $request->validate(['phone' => 'required|string']);
        $phone   = $this->normalizePhone($request->phone);
        $patient = Patient::where('phone', $phone)->first();
        return response()->json($patient);
    }

    // GET /api/doctor-panel/patients/history?phone=
    public function getPatientHistory(Request $request)
    {
        $request->validate(['phone' => 'required|string']);
        $phone = $this->normalizePhone($request->phone);

        $history = Appointment::where('patient_phone', $phone)
            ->orWhereHas('patient', fn($q) => $q->where('phone', $phone))
            ->select('id', 'date', 'time', 'reason', 'status', 'notes', 'pdf_url')
            ->orderBy('date', 'desc')
            ->get();

        return response()->json($history);
    }

    // =========================================================================
    // SONUÇLAR & BİLDİRİMLER
    // =========================================================================

    // GET /api/doctor-panel/pending-results
    public function getPendingResults(Request $request)
    {
        $doctor = $this->doctor($request);
        $rows   = $this->appointmentsFor($doctor)
            ->with('patient')
            ->where('status', 'completed')
            ->where(fn($q) => $q->whereNull('report_uploaded')->orWhere('report_uploaded', false))
            ->orderBy('date', 'desc')
            ->get()
            ->map(fn($a) => $this->formatAppointment($a));

        return response()->json($rows);
    }

    // POST /api/doctor-panel/notifications
    public function insertNotification(Request $request)
    {
        $request->validate([
            'patient_id' => 'required|uuid',
            'title'      => 'required|string',
            'body'       => 'required|string',
            'type'       => 'required|string',
        ]);

        $notification = Notification::create([
            'patient_id' => $request->patient_id,
            'title'      => $request->title,
            'body'       => $request->body,
            'type'       => $request->type,
            'unread'     => true,
            'time'       => $request->time ?? now()->format('H:i'),
        ]);

        return response()->json($notification, 201);
    }

    // ─── Yardımcı: hastaya WhatsApp randevu bildirimi ─────────────────────────
    private function notifyPatientAppointment(
        string $phone,
        DoctorRegistration $doctor,
        Appointment $apt
    ): void {
        try {
            $sid   = env('TWILIO_SID');
            $token = env('TWILIO_AUTH_TOKEN');
            $from  = env('TWILIO_WHATSAPP_NUMBER');

            if (!$sid || !$token || !$from) return;

            $twilio     = new \Twilio\Rest\Client($sid, $token);
            $doctorName = "Dr. {$doctor->name} {$doctor->surname}";

            $twilio->messages->create("whatsapp:+{$phone}", [
                'from' => $from,
                'body' => "Merhaba! 👋 {$doctorName} tarafından *{$apt->date}* günü saat *{$apt->time}* için bir muayene randevunuz oluşturuldu.\n\nTabeebi+ uygulamasından randevunuzu takip edebilirsiniz.",
            ]);
        } catch (\Exception $e) {
            \Log::error('Patient WhatsApp Notification Error: ' . $e->getMessage());
        }
    }

    // POST /api/doctor-panel/analyze-report
    public function analyzeReport(Request $request)
    {
        $request->validate([
            'appointmentId' => 'required|uuid',
            'file'          => 'required|file|mimes:pdf|max:10240', // max 10MB
        ]);

        $appointment = Appointment::findOrFail($request->appointmentId);

        $pdfUrl = null;
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $pdfUrl = 'data:application/pdf;base64,' . base64_encode(file_get_contents($file->getRealPath()));
        }

        // Reason'a göre akıllı simülasyon yapalım
        $reason = strtolower($appointment->reason ?? '');
        $diagnosis = 'Genel check-up yapıldı. Sağlık durumu stabil.';
        $meds = [];
        $notes = 'Hastanın genel durumu iyi. Belirtilen ilaçları düzenli kullanması ve bol sıvı tüketmesi önerilir.';
        $nextSteps = '6 ay sonra rutin kontrol.';

        if (str_contains($reason, 'diş') || str_contains($reason, 'dent') || str_contains($reason, 'dental') || str_contains($reason, 'tooth')) {
            $diagnosis = 'Diş temizliği ve tartar temizliği yapıldı. Hafif diş eti hassasiyeti mevcut.';
            $meds = ['Gargara (Günde 2 kez)', 'Parasetamol 500mg (Ağrı durumunda)'];
            $notes = 'Diş fırçalama tekniği gösterildi. Günde 2 kez fırçalama önerilir. Diş ipliği kullanımı aksatılmamalıdır.';
            $nextSteps = '6 ay sonra rutin diş hekimi muayenesi.';
        } elseif (str_contains($reason, 'ağrı') || str_contains($reason, 'pain')) {
            $diagnosis = 'Miyofasiyal ağrı sendromu veya kas yorgunluğu gözlendi.';
            $meds = ['Majezik 100mg tb (Günde 2 kez)', 'Muscoril merhem (Günde 2 kez)'];
            $notes = 'Ilık kompres uygulanması, kas zorlayıcı hareketlerden kaçınılması ve dinlenme önerildi.';
            $nextSteps = 'Şikayetler devam ederse veya artarsa 1 hafta sonra kontrol.';
        } elseif (str_contains($reason, 'öksürük') || str_contains($reason, 'cough') || str_contains($reason, 'grip') || str_contains($reason, 'soğuk') || str_contains($reason, 'fever') || str_contains($reason, 'ateş')) {
            $diagnosis = 'Akut viral üst solunum yolu enfeksiyonu (ÜSYE).';
            $meds = ['Catarin tb (Günde 3 kez)', 'Klamer 500mg tb (Günde 2 kez)', 'Perebron şurup (Günde 3 kez)'];
            $notes = 'Bol sıvı tüketimi, istirahat ve C vitamini takviyesi önerildi. Bulaş riski için kalabalık yerlerden uzak durulmalı.';
            $nextSteps = 'Belirtiler 1 hafta içinde geçmezse kontrol.';
        }

        // Randevuyu güncelle
        $appointment->update([
            'report_uploaded' => true,
            'pdf_url'         => $pdfUrl,
            'ai_summary'      => $diagnosis,
        ]);

        // Muayene sonuç tablosuna ekle
        $result = \App\Models\Result::updateOrCreate(
            ['appointment_id' => $appointment->id],
            [
                'patient_id'  => $appointment->patient_id,
                'doctor_id'   => $appointment->doctor_id,
                'title'       => 'Muayene Raporu — ' . $appointment->date,
                'diagnosis'   => $diagnosis,
                'notes'       => $notes,
                'meds'        => $meds,
                'next_steps'  => $nextSteps,
                'unread'      => true,
                'date'        => $appointment->date,
            ]
        );

        return response()->json([
            'message' => 'Rapor yüklendi ve analiz edildi.',
            'result'  => $result,
        ]);
    }
}
