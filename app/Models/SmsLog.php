<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SmsLog extends Model
{
    protected $fillable = [
        'phone',
        'message',
        'status',
        'sent_at',
        'reference',
        'response',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
        'response' => 'json',
    ];
}

