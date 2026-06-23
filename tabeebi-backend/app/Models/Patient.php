<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Patient extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasUuids;

    const UPDATED_AT = null;

    protected $fillable = [
        'phone',
        'name',
        'avatar_hue',
        'patient_code',
        'is_registered',
        'push_token',
    ];

    protected $hidden = [
        'push_token',
    ];
}
