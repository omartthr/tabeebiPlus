<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Result extends Model
{
    use HasUuids;

    protected $fillable = [
        'patient_id', 'doctor_id', 'appointment_id', 'title', 'diagnosis',
        'notes', 'meds', 'next_steps', 'unread', 'date'
    ];

    protected $casts = [
        'meds' => 'array',
        'unread' => 'boolean',
    ];

    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }
}
