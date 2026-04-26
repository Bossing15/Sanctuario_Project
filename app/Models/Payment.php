<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $fillable = [
        'client_id',
        'booking_id',
        'grave_id',
        'service_id',
        'product_id',
        'request_id',
        'reservation_id',
        'reservation_code',
        'invoice_number',
        'user_id',
        'amount',
        'payment_method',
        'payment_type',
        'payment_reference',
        'transaction_id',
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

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'user_id');
    }

    public function request(): BelongsTo
    {
        return $this->belongsTo(Request::class, 'request_id');
    }

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class);
    }
}
