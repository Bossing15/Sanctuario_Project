<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Request extends Model
{
    protected $table = 'requests';

    protected $fillable = [
        'user_id',
        'product_id',
        'service_id',
        'payment_plan_id',
        'lot_id',
        'lot_type',
        'deceased_name',
        'deceased_date_of_death',
        'deceased_relationship',
        'additional_deceased_info',
        'status',
        'admin_id',
        'approved_at',
        'rejected_at',
        'rejection_reason',
        'cancelled_at',
        'status_history',
        'invoice_number',
        'amount',
    ];

    protected $casts = [
        'deceased_date_of_death' => 'date',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'additional_deceased_info' => 'array',
        'status_history' => 'array',
    ];

    // Boot method to generate invoice number
    protected static function boot()
    {
        parent::boot();

        static::created(function ($model) {
            if (!$model->invoice_number) {
                $model->update([
                    'invoice_number' => 'SANC-' . $model->id . '-' . substr($model->created_at->timestamp, -6)
                ]);
            }
        });
    }

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'user_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function paymentPlan(): BelongsTo
    {
        return $this->belongsTo(PaymentPlan::class);
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(Admin::class);
    }

    public function lot()
    {
        return match($this->lot_type) {
            'LawnLot' => $this->belongsTo(LawnLot::class, 'lot_id'),
            'Columbarium' => $this->belongsTo(Columbarium::class, 'lot_id'),
            'FamilyEstate' => $this->belongsTo(FamilyEstate::class, 'lot_id'),
            default => null,
        };
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class, 'request_id');
    }

    // Status Management Methods
    public function approve(Admin $admin): void
    {
        $this->status = 'Approved';
        $this->admin_id = $admin->id;
        $this->approved_at = now();
        $this->recordStatusChange('Approved', $admin->id);
        $this->save();
    }

    public function reject(Admin $admin, string $reason): void
    {
        $this->status = 'Rejected';
        $this->admin_id = $admin->id;
        $this->rejected_at = now();
        $this->rejection_reason = $reason;
        $this->recordStatusChange('Rejected', $admin->id, $reason);
        $this->save();
    }

    public function cancel(): void
    {
        $this->status = 'Cancelled';
        $this->cancelled_at = now();
        $this->recordStatusChange('Cancelled');
        $this->save();
    }

    private function recordStatusChange(string $status, ?int $adminId = null, ?string $reason = null): void
    {
        $history = $this->status_history ?? [];
        $history[] = [
            'status' => $status,
            'timestamp' => now()->toIso8601String(),
            'admin_id' => $adminId,
            'reason' => $reason,
        ];
        $this->status_history = $history;
    }

    // Query Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'Pending_Approval');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'Approved');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'Rejected');
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }
}
