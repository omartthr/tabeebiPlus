<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Laravel\Sanctum\HasApiTokens;

class DoctorRegistration extends Authenticatable
{
    use HasApiTokens, HasUuids;

    protected $table = 'doctor_registrations';

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($model) {
            // If the registration is approved and does not have a doctor profile created yet
            if ($model->status === 'approved' && !$model->doctors_id) {
                $fullName = $model->name;
                if ($model->surname) {
                    $fullName .= ' ' . $model->surname;
                }
                
                // Add "Dr. " prefix if not present
                if (!str_starts_with(strtolower($fullName), 'dr.')) {
                    $fullName = 'Dr. ' . $fullName;
                }

                $initials = '';
                $names = explode(' ', $fullName);
                foreach ($names as $n) {
                    $initials .= substr($n, 0, 1);
                }
                $initials = strtoupper(substr($initials, 0, 10));

                $doctor = \App\Models\Doctor::create([
                    'name'             => $fullName,
                    'specialty'        => $model->specialty,
                    'initials'         => $initials ?: 'DR',
                    'hue'              => rand(0, 360),
                    'price'            => (string) ($model->price ?? '0'),
                    'loc'              => $model->location_address ? substr($model->location_address, 0, 50) : 'Kirkuk',
                    'exp'              => ($model->exp_years ?? 1) . ' yrs',
                    'today'            => false,
                    'is_active'        => true,
                    'registration_id'  => $model->id,
                    'location_address' => $model->location_address,
                    'location_lat'     => $model->location_lat,
                    'location_lng'     => $model->location_lng,
                    'schedule'         => $model->schedule?->schedule
                ]);

                $model->doctors_id = $doctor->id;
            }
        });
    }

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
