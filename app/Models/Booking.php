<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $fillable = [
        'user_id',
        'client_id',
        'service_id',
        'product_id',
        'grave_id',
        'status',
        'booking_date',
        'plan_type',
        'amount',
        'notes',
        'total_amount',
        'payment_id',
        'requirement_status',
        'authorization_status',
        'approved_by',
        'approved_at',
        'rejection_reason',
        'rejected_at',
        'service_completion_status',
        'completion_images',
        'completion_date',
    ];

    protected $with = ['service', 'product', 'user'];

    protected $casts = [
        'booking_date' => 'datetime',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'completion_date' => 'datetime',
        'completion_images' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(Client::class, 'user_id');
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }

    public function grave()
    {
        return $this->belongsTo(Grave::class);
    }

    public function approver()
    {
        return $this->belongsTo(Admin::class, 'approved_by');
    }
}
