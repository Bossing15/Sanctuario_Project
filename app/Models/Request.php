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
        'progress_status',
        'progress_percentage',
        'current_progress_note',
        'progress_updates',
        'progress_started_at',
        'progress_completed_at',
    ];

    protected $casts = [
        'deceased_date_of_death' => 'date',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'additional_deceased_info' => 'array',
        'status_history' => 'array',
        'progress_updates' => 'array',
        'progress_started_at' => 'datetime',
        'progress_completed_at' => 'datetime',
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
        return $this->belongsTo(Property::class, 'product_id');
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

    // Progress Tracking Methods
    public function updateProgress(Admin $admin, string $progressStatus, int $percentage, string $note): void
    {
        // Update progress fields
        $this->progress_status = $progressStatus;
        $this->progress_percentage = min(100, max(0, $percentage)); // Ensure 0-100 range
        $this->current_progress_note = $note;

        // Set timestamps based on status
        if ($progressStatus === 'In Progress' && !$this->progress_started_at) {
            $this->progress_started_at = now();
        }

        if ($progressStatus === 'Completed' && !$this->progress_completed_at) {
            $this->progress_completed_at = now();
            $this->progress_percentage = 100;
        }

        // Add to progress history
        $this->addProgressUpdate($admin, $progressStatus, $percentage, $note);

        $this->save();

        // Create notification for the client
        $this->notifyClientOfProgress($progressStatus, $note);
    }

    private function addProgressUpdate(Admin $admin, string $status, int $percentage, string $note): void
    {
        $updates = $this->progress_updates ?? [];
        $updates[] = [
            'status' => $status,
            'percentage' => $percentage,
            'note' => $note,
            'admin_id' => $admin->id,
            'admin_name' => $admin->username ?? $admin->name ?? 'Admin',
            'timestamp' => now()->toIso8601String(),
        ];
        $this->progress_updates = $updates;
    }

    private function notifyClientOfProgress(string $status, string $note): void
    {
        // Create notification for the client
        Notification::create([
            'user_id' => $this->user_id,
            'type' => 'maintenance_progress',
            'title' => 'Maintenance Service Update',
            'message' => "Your maintenance service request (Invoice: {$this->invoice_number}) status: {$status}. {$note}",
            'data' => json_encode([
                'request_id' => $this->id,
                'invoice_number' => $this->invoice_number,
                'progress_status' => $status,
                'progress_percentage' => $this->progress_percentage,
                'note' => $note,
            ]),
            'is_read' => false,
        ]);
    }

    public function canUpdateProgress(): bool
    {
        // Can update progress if request is approved
        return $this->status === 'Approved';
    }

    public function getProgressHistory(): array
    {
        return $this->progress_updates ?? [];
    }

    public function getLatestProgressUpdate(): ?array
    {
        $updates = $this->progress_updates ?? [];
        return !empty($updates) ? end($updates) : null;
    }
}
