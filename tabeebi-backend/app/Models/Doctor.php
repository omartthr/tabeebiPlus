<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Doctor extends Model
{
    use HasUuids;

    const UPDATED_AT = null;

    protected $fillable = [
        'name', 'specialty', 'initials', 'hue', 'rating', 'reviews',
        'price', 'loc', 'exp', 'today', 'is_active', 'registration_id',
        'location_address', 'location_lat', 'location_lng', 'schedule'
    ];

    protected $casts = [
        'schedule' => 'array', // JSON kolonunu otomatik diziye çevirir
        'today' => 'boolean',
        'is_active' => 'boolean',
    ];
}
