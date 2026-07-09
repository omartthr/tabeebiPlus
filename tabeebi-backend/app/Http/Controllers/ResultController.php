<?php

namespace App\Http\Controllers;

use App\Models\Result;
use Illuminate\Http\Request;

class ResultController extends Controller
{
    /**
     * Hastanın kendi muayene sonuçlarını getirir
     */
    public function index(Request $request)
    {
        $patientId = $request->user()->id;

        $results = Result::with(['doctor', 'appointment'])
            ->where('patient_id', $patientId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($results);
    }
}
