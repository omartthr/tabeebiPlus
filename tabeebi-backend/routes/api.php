<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ResultController;
use App\Http\Controllers\SupportTicketController;

// --- AUTH & PATIENT ROUTES ---
Route::get('/patients/{phone}', [AuthController::class, 'getPatient']);
Route::post('/auth/send-otp', [AuthController::class, 'sendOtp']);
Route::post('/auth/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/auth/register', [AuthController::class, 'register']);
// /auth/login için aslında send-otp kullanılıyor mobil tarafta, ama istersen ayrıca yazabiliriz
Route::post('/auth/login', [AuthController::class, 'sendOtp']);

// --- DOCTORS ROUTES ---
Route::get('/doctors', [DoctorController::class, 'index']);
Route::get('/doctors/{id}', [DoctorController::class, 'show']);
Route::get('/doctors/{id}/schedule', [DoctorController::class, 'schedule']);

// --- APPOINTMENTS (Public) ---
Route::get('/appointments/booked-times', [AppointmentController::class, 'bookedTimes']);

// Yetki (Token) gerektiren rotalar
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    
    // Appointments
    Route::post('/appointments', [AppointmentController::class, 'store']);
    Route::get('/appointments/my-appointments', [AppointmentController::class, 'myAppointments']);
    Route::get('/appointments/next', [AppointmentController::class, 'nextAppointment']);
    Route::patch('/appointments/{id}', [AppointmentController::class, 'update']);
    
    // Doctors
    Route::get('/doctors/recommended', [DoctorController::class, 'recommended']);
    
    // Patient Stats & Account
    Route::get('/patient/counts', [PatientController::class, 'counts']);
    Route::delete('/account', [PatientController::class, 'destroy']);
    
    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/mark-read', [NotificationController::class, 'markRead']);
    
    // Results
    Route::get('/results', [ResultController::class, 'index']);
    
    // Support Tickets
    Route::get('/support_tickets', [SupportTicketController::class, 'index']);
    Route::post('/support_tickets', [SupportTicketController::class, 'store']);
});
