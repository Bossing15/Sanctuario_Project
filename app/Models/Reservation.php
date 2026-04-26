<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Reservation extends Model
{
    protected $fillable = [
        'user_id',
        'product_id',
        'service_id',
        'lot_id',
        'lot_type',
        'deceased_name',
        'deceased_date_of_death',
        'deceased_relationship',
        'plan_type',
        'amount',
        'status',
        'admin_notes',
        'approved_by',
        'approved_at',
        'rejected_at',
        'reservation_code',
        'invoice_number',
    ];

    protected $casts = [
        'deceased_date_of_death' => 'date',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Boot method to generate reservation code and invoice number
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (!$model->reservation_code) {
                $model->reservation_code = 'RES-' . strtoupper(Str::random(8)) . '-' . time();
            }
        });

        static::created(function ($model) {
            if (!$model->invoice_number) {
                $model->update([
                    'invoice_number' => 'SANC-' . $model->id . '-' . substr($model->created_at->timestamp, -6)
                ]);
            }
        });
    }

    // Relationships
    public function user()
    {
        return $this->belongsTo(Client::class, 'user_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function lot()
    {
        return $this->belongsTo(LawnLot::class, 'lot_id');
    }

    public function approvedBy()
    {
        return $this->belongsTo(Admin::class, 'approved_by');
    }

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    // Methods
    public function approve($adminId, $notes = null)
    {
        $this->update([
            'status' => 'approved',
            'approved_by' => $adminId,
            'approved_at' => now(),
            'admin_notes' => $notes,
        ]);
    }

    public function reject($adminId, $notes = null)
    {
        $this->update([
            'status' => 'rejected',
            'approved_by' => $adminId,
            'rejected_at' => now(),
            'admin_notes' => $notes,
        ]);
    }

    public function cancel()
    {
        $this->update([
            'status' => 'cancelled',
        ]);
    }
}
