<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DoctorSchedule extends Model
{
    protected $table = 'doctor_schedules';

    // Tablo sadece updated_at tutuyor, created_at yok
    public $timestamps = false;

    protected $primaryKey = 'doctor_registration_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['doctor_registration_id', 'schedule', 'updated_at'];

    protected $casts = [
        'schedule'   => 'array',
        'updated_at' => 'datetime',
    ];
}
