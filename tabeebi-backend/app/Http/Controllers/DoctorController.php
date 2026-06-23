<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use Illuminate\Http\Request;

class DoctorController extends Controller
{
    /**
     * Tüm onaylı doktorları listeler
     */
    public function index()
    {
        $doctors = Doctor::where('is_active', true)->get();
        return response()->json($doctors);
    }

    /**
     * Tekil doktor detayını getirir
     */
    public function show($id)
    {
        $doctor = Doctor::find($id);
        if (!$doctor) {
            return response()->json(['error' => 'Doctor not found'], 404);
        }
        return response()->json($doctor);
    }

    /**
     * Doktorun çalışma saatlerini (JSON formatında) getirir
     */
    public function schedule($id)
    {
        $doctor = Doctor::find($id);
        
        if (!$doctor) {
            return response()->json(['error' => 'Doctor not found'], 404);
        }

        // Eğer doctor_schedules tablosu kullanılıyorsa oradan da çekilebilir.
        // Ama şemaya göre schedule alanı doctors tablosunda da var. 
        // Şimdilik doctors tablosundaki JSON objesini dönüyoruz.
        return response()->json($doctor->schedule ?? []);
    }

    /**
     * Önerilen doktorları getirir
     */
    public function recommended()
    {
        // Şimdilik en yüksek puanlı veya rastgele 5 aktif doktoru getirelim
        $doctors = Doctor::where('is_active', true)
            ->orderBy('rating', 'desc')
            ->take(5)
            ->get();
            
        return response()->json($doctors);
    }
}
