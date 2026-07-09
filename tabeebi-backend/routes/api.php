<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ResultController;
use App\Http\Controllers\SupportTicketController;
use App\Http\Controllers\DoctorAuthController;
use App\Http\Controllers\DoctorPanelController;

// =============================================================================
// MOBİL UYGULAMA ROTALARI (Mevcut)
// =============================================================================

// --- Auth & Hasta ---
Route::get('/patients/{phone}', [AuthController::class, 'getPatient']);
Route::middleware('throttle:5,1')->group(function () {
    // OTP: dakikada en fazla 5 istek (brute force koruması)
    Route::post('/auth/send-otp',   [AuthController::class, 'sendOtp']);
    Route::post('/auth/verify-otp', [AuthController::class, 'verifyOtp']);
    Route::post('/auth/login',      [AuthController::class, 'sendOtp']);
});
Route::post('/auth/register', [AuthController::class, 'register']);

// --- Doktor Listesi (Public) ---
Route::get('/doctors/recommended',  [DoctorController::class, 'recommended']);
Route::get('/doctors',              [DoctorController::class, 'index']);
Route::get('/doctors/{id}',         [DoctorController::class, 'show']);
Route::get('/doctors/{id}/schedule',[DoctorController::class, 'schedule']);

// --- Randevu (Public) ---
Route::get('/appointments/booked-times', [AppointmentController::class, 'bookedTimes']);

// --- Token Gerektiren Mobil Rotalar ---
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Randevular
    Route::post('/appointments',                    [AppointmentController::class, 'store']);
    Route::get('/appointments/my-appointments',     [AppointmentController::class, 'myAppointments']);
    Route::get('/appointments/next',                [AppointmentController::class, 'nextAppointment']);
    Route::patch('/appointments/{id}',              [AppointmentController::class, 'update']);

    // Hasta
    Route::get('/patient/counts', [PatientController::class, 'counts']);
    Route::delete('/account',     [PatientController::class, 'destroy']);

    // Bildirimler
    Route::get('/notifications',           [NotificationController::class, 'index']);
    Route::patch('/notifications/mark-read',[NotificationController::class, 'markRead']);

    // Sonuçlar
    Route::get('/results', [ResultController::class, 'index']);

    // Destek Talepleri
    Route::get('/support_tickets',  [SupportTicketController::class, 'index']);
    Route::post('/support_tickets', [SupportTicketController::class, 'store']);
});

// =============================================================================
// DOKTOR PANELİ ROTALARI (Yeni)
// =============================================================================

// --- Auth: Token Gerekmez ---
Route::prefix('doctor-panel/auth')->group(function () {
    Route::middleware('throttle:5,1')->group(function () {
        // OTP: dakikada en fazla 5 istek (brute force koruması)
        Route::post('/send-otp',   [DoctorAuthController::class, 'sendOtp']);
        Route::post('/verify-otp', [DoctorAuthController::class, 'verifyOtp']);
    });
    Route::post('/register', [DoctorAuthController::class, 'register']);
    Route::get('/check',     [DoctorAuthController::class, 'checkDoctor']); // ?phone=
});

// --- Panel: Sanctum Token Gerekir ---
Route::middleware('auth:sanctum')->prefix('doctor-panel')->group(function () {

    // Profil
    Route::get('/profile', [DoctorPanelController::class, 'getProfile']);
    Route::put('/profile', [DoctorPanelController::class, 'updateProfile']);

    // Takvim
    Route::get('/schedule', [DoctorPanelController::class, 'getSchedule']);
    Route::put('/schedule', [DoctorPanelController::class, 'updateSchedule']);

    // Dashboard & İstatistik
    Route::get('/dashboard',   [DoctorPanelController::class, 'getDashboard']);
    Route::get('/statistics',  [DoctorPanelController::class, 'getStatistics']);

    // Randevular
    Route::get('/appointments/pending-count',          [DoctorPanelController::class, 'getPendingCount']);
    Route::get('/appointments/collision',              [DoctorPanelController::class, 'checkCollision']); // ?date=&time=
    Route::post('/appointments/manual',                [DoctorPanelController::class, 'createManualAppointment']);
    Route::patch('/appointments/{id}/status',          [DoctorPanelController::class, 'updateAppointmentStatus']);
    Route::patch('/appointments/{id}/report-uploaded', [DoctorPanelController::class, 'markReportUploaded']);

    // Hastalar
    Route::get('/patients',             [DoctorPanelController::class, 'getPatients']);
    Route::get('/patients/lookup',      [DoctorPanelController::class, 'lookupPatient']);  // ?phone=
    Route::get('/patients/history',     [DoctorPanelController::class, 'getPatientHistory']); // ?phone=
    Route::post('/patients/temporary',  [DoctorPanelController::class, 'createTemporaryPatient']);

    // Sonuçlar
    Route::get('/pending-results', [DoctorPanelController::class, 'getPendingResults']);

    // Bildirimler (doktor → hasta)
    Route::post('/notifications', [DoctorPanelController::class, 'insertNotification']);
});
