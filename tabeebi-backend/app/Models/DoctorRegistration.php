<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Laravel\Sanctum\HasApiTokens;

class DoctorRegistration extends Authenticatable
{
    use HasApiTokens, HasUuids;

    protected $table = 'doctor_registrations';

    // Supabase tablosunda updated_at kolonu yok
    const UPDATED_AT = null;

    protected $fillable = [
        'phone', 'name', 'surname', 'specialty', 'clinic_name', 'status',
        'doctors_id', 'location_address', 'location_lat', 'location_lng',
        'price', 'exp_years', 'birth_date',
    ];

    protected $casts = [
        'location_lat' => 'float',
        'location_lng' => 'float',
        'price'        => 'integer',
        'exp_years'    => 'integer',
    ];

    protected $hidden = ['remember_token'];

    // doctor_registrations.doctors_id → doctors.id
    public function doctorProfile(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Doctor::class, 'doctors_id');
    }

    // Çalışma takvimi
    public function schedule(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(DoctorSchedule::class, 'doctor_registration_id');
    }
}
