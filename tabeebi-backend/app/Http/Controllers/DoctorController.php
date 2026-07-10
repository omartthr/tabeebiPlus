<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use Illuminate\Http\Request;

class DoctorController extends Controller
{
    /**
     * Tum onayli doktorlari listeler.
     * specialties=Ortodonti,Laboratuvar ile kategori bazli onerili siralama yapar.
     */
    public function index(Request $request)
    {
        $doctors = $this->buildRecommendedQuery($request)->get();
        return response()->json($doctors);
    }

    /**
     * Tekil doktor detayini getirir
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
     * Doktorun calisma saatlerini (JSON formatinda) getirir
     */
    public function schedule($id)
    {
        $doctor = Doctor::find($id);
        
        if (!$doctor) {
            return response()->json(['error' => 'Doctor not found'], 404);
        }

        return response()->json($doctor->schedule ?? []);
    }

    /**
     * Onerilen doktorlari getirir. Kategori verilirse once o kategorinin en iyileri gelir.
     */
    public function recommended(Request $request)
    {
        $doctors = $this->buildRecommendedQuery($request)
            ->take(5)
            ->get();
            
        return response()->json($doctors);
    }

    private function buildRecommendedQuery(Request $request)
    {
        $specialties = $this->specialtiesFromRequest($request);

        return Doctor::where('is_active', true)
            ->when(!empty($specialties), function ($query) use ($specialties) {
                $query->whereIn('specialty', $specialties);
            })
            ->orderByRaw('rating IS NULL')
            ->orderByDesc('rating')
            ->orderByDesc('reviews')
            ->orderByDesc('today')
            ->orderBy('name');
    }

    private function specialtiesFromRequest(Request $request): array
    {
        $raw = $request->query('specialties', $request->query('specialty'));

        if (is_array($raw)) {
            return array_values(array_filter($raw));
        }

        if (is_string($raw) && trim($raw) !== '') {
            return array_values(array_filter(array_map('trim', explode(',', $raw))));
        }

        return [];
    }
}
