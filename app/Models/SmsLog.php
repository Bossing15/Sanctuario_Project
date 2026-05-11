<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SmsLog extends Model
{
    protected $fillable = [
        'client_id',
        'phone_number',
        'message',
        'type',
        'status',
        'error_message',
        'sent_at',
        'reference',
        'response',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
        'response' => 'json',
    ];
}
