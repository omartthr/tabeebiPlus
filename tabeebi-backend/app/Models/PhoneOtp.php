<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PhoneOtp extends Model
{
    public $timestamps = false;
    protected $primaryKey = 'phone';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'phone',
        'otp',
        'expires_at',
        'created_at'
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'created_at' => 'datetime',
    ];
}
