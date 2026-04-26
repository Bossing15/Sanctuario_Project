<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentPlan extends Model
{
    protected $fillable = [
        'client_id',
        'service_id',
        'plan_name',
        'total_amount',
        'amount_paid',
        'total_installments',
        'installments_paid',
        'installment_amount',
        'frequency',
        'start_date',
        'next_due_date',
        'status',
        'notes'
    ];
}
