<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Notification extends Model
{
    use HasUuids;

    protected $fillable = [
        'patient_id', 'type', 'title', 'body', 'unread', 'time'
    ];

    protected $casts = [
        'unread' => 'boolean',
    ];
}
