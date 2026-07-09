<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Appointment extends Model
{
    use HasUuids;

    const UPDATED_AT = null;

    protected $fillable = [
        'patient_id', 'doctor_id', 'doctor_registration_id', 'date', 'time',
        'duration', 'status', 'payment', 'clinic', 'notes', 'reason', 'price',
        'patient_name', 'patient_phone', 'report_uploaded', 'pdf_url',
        'ai_summary', 'reported', 'reminder_sent', 'rating', 'review'
    ];

    protected $casts = [
        'report_uploaded' => 'boolean',
        'reported' => 'boolean',
        'reminder_sent' => 'boolean',
    ];

    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}
