<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Result extends Model
{
    use HasUuids;

    const UPDATED_AT = null;

    protected $fillable = [
        'patient_id', 'doctor_id', 'appointment_id', 'title', 'diagnosis',
        'notes', 'meds', 'next_steps', 'unread', 'date'
    ];

    protected $casts = [
        'meds' => 'array',
        'unread' => 'boolean',
    ];

    protected $appends = ['pdf_url'];

    public function getPdfUrlAttribute()
    {
        if ($this->appointment?->pdf_url) {
            return url('/storage/reports/' . $this->appointment->id);
        }
        return null;
    }

    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }

    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }
}
