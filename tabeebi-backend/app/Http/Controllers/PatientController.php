<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Notification;
use App\Models\Result;
use Illuminate\Http\Request;

class PatientController extends Controller
{
    /**
     * Dashboard için hasta istatistiklerini getirir
     */
    public function counts(Request $request)
    {
        $patientId = $request->user()->id;
        
        $upcomingAppointments = Appointment::where('patient_id', $patientId)
            ->where('date', '>=', date('Y-m-d'))
            ->where('status', '!=', 'cancelled')
            ->count();
            
        $unreadResults = Result::where('patient_id', $patientId)
            ->where('unread', true)
            ->count();
            
        $unreadNotifications = Notification::where('patient_id', $patientId)
            ->where('unread', true)
            ->count();
            
        return response()->json([
            'upcoming_appointments' => $upcomingAppointments,
            'unread_results' => $unreadResults,
            'unread_notifications' => $unreadNotifications
        ]);
    }

    /**
     * Kullanıcı hesabını siler
     */
    public function destroy(Request $request)
    {
        $patient = $request->user();
        
        // Sanctum tokenları sil
        $patient->tokens()->delete();
        
        // Kullanıcıyı sil (Cascade silme veritabanı seviyesinde yapıldıysa ilişkili veriler de silinir)
        $patient->delete();
        
        return response()->json(['message' => 'Account deleted successfully']);
    }
}
