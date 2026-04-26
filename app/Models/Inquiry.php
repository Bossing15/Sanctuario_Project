<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Inquiry extends Model
{
    protected $fillable = [
        'full_name',
        'name',
        'email',
        'phone',
        'message',
        'status',
        'service_type',
        'product_interest',
        'grave_location',
        'maintenance_photos',
        'invoice_number',
        'payment_id',
        'transaction_id',
        'payment_status',
        'paid_at',
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
}
