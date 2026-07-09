<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/storage/reports/{identifier}', function ($identifier) {
    try {
        // 1. Try to find appointment by UUID or by filename match in pdf_url
        $appointment = null;
        if (preg_match('/^[a-f\d]{8}-(?:[a-f\d]{4}-){3}[a-f\d]{12}$/i', $identifier)) {
            $appointment = \App\Models\Appointment::find($identifier);
        } else {
            $appointment = \App\Models\Appointment::where('pdf_url', 'like', '%' . $identifier . '%')->first();
        }

        if ($appointment && $appointment->pdf_url) {
            if (str_starts_with($appointment->pdf_url, 'data:application/pdf;base64,')) {
                $base64 = substr($appointment->pdf_url, strlen('data:application/pdf;base64,'));
                return response(base64_decode($base64), 200, [
                    'Content-Type' => 'application/pdf',
                    'Content-Disposition' => 'inline; filename="report-' . $appointment->id . '.pdf"'
                ]);
            }
        }

        // 2. Fallback: check if the file exists on the local disk
        $path = storage_path('app/public/reports/' . $identifier);
        if (file_exists($path)) {
            return response()->file($path, [
                'Content-Type' => 'application/pdf',
            ]);
        }

        return response('Rapor bulunamadı / Report not found', 404);
    } catch (\Throwable $e) {
        return response('Diagnostic Error: ' . $e->getMessage() . "\n" . $e->getTraceAsString(), 500, [
            'Content-Type' => 'text/plain'
        ]);
    }
});
