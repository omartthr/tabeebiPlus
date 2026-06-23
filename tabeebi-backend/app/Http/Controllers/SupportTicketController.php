<?php

namespace App\Http\Controllers;

use App\Models\SupportTicket;
use Illuminate\Http\Request;

class SupportTicketController extends Controller
{
    public function index(Request $request)
    {
        $patientId = $request->user()->id;
        
        $tickets = SupportTicket::where('patient_id', $patientId)
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($tickets);
    }

    public function store(Request $request)
    {
        $request->validate([
            'subject' => 'required|string',
            'message' => 'required|string',
        ]);
        
        $ticket = SupportTicket::create([
            'patient_id' => $request->user()->id,
            'category' => $request->category ?? 'General',
            'subject' => $request->subject,
            'message' => $request->message,
            'status' => 'open'
        ]);
        
        return response()->json($ticket, 201);
    }
}
