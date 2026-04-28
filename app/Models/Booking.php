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
        'progress_status',
        'progress_percentage',
        'current_progress_note',
        'progress_updates',
        'progress_started_at',
        'progress_completed_at',
    ];

    protected $with = ['service', 'product', 'user'];

    protected $casts = [
        'booking_date' => 'datetime',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'completion_date' => 'datetime',
        'completion_images' => 'array',
        'progress_updates' => 'array',
        'progress_started_at' => 'datetime',
        'progress_completed_at' => 'datetime',
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

    /**
     * Update progress for this booking
     */
    public function updateProgress($status, $percentage, $note, $adminName)
    {
        $updates = $this->progress_updates ?? [];
        
        $updates[] = [
            'status' => $status,
            'percentage' => $percentage,
            'note' => $note,
            'admin_name' => $adminName,
            'timestamp' => now()->toDateTimeString(),
        ];

        $this->update([
            'progress_status' => $status,
            'progress_percentage' => $percentage,
            'current_progress_note' => $note,
            'progress_updates' => $updates,
            'progress_started_at' => $this->progress_started_at ?? now(),
            'progress_completed_at' => $status === 'Completed' ? now() : null,
        ]);

        return $this;
    }

    /**
     * Check if admin can update progress
     */
    public function canUpdateProgress()
    {
        // Can update progress if booking is approved (AUTHORIZED or AUTO_APPROVED)
        return in_array($this->authorization_status, ['AUTHORIZED', 'AUTO_APPROVED']);
    }

    /**
     * Get progress history
     */
    public function getProgressHistory()
    {
        return $this->progress_updates ?? [];
    }
}
