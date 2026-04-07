<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $fillable = [
        'client_id',
        'service_id',
        'status',
        'booking_date',
    ];

    protected $casts = [
        'booking_date' => 'datetime',
    ];
}
