<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'client_id',
        'amount',
        'payment_method',
        'payment_type',
        'status',
        'due_date',
        'paid_date',
        'description',
        'payment_reference',
    ];

    protected $casts = [
        'due_date' => 'datetime',
        'paid_date' => 'datetime',
    ];
}
