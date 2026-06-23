<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class SupportTicket extends Model
{
    use HasUuids;

    protected $fillable = [
        'patient_id', 'category', 'subject', 'message', 'status', 'last_response'
    ];
}
