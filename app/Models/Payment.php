<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'client_id',
        'booking_id',
        'grave_id',
        'service_id',
        'product_id',
        'amount',
        'payment_method',
        'payment_type',
        'payment_reference',
        'status',
        'due_date',
        'paid_date',
        'description',
        'metadata',
        'penalty_amount',
        'reminder_sent',
        'reminder_sent_at',
        'receipt_path',
        'paymongo_intent_id',
        'paymongo_client_key',
        'customer_name',
        'service_type',
        'completed_at',
    ];

    protected $casts = [
        'due_date' => 'datetime',
        'paid_date' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }
}
