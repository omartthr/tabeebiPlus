<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $patientId = $request->user()->id;
        
        $notifications = Notification::where('patient_id', $patientId)
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($notifications);
    }

    public function markRead(Request $request)
    {
        $patientId = $request->user()->id;
        $notificationId = $request->input('id'); // optional
        
        $query = Notification::where('patient_id', $patientId)->where('unread', true);
        
        if ($notificationId) {
            $query->where('id', $notificationId);
        }
        
        $query->update(['unread' => false]);
        
        return response()->json(['message' => 'Notifications marked as read']);
    }
}
