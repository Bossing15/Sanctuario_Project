<?php namespace App\Models; use Illuminate\Database\Eloquent\Model; class PaymentPlan extends Model { protected $fillable = ['client_id', 'total_amount', 'installment_amount', 'status']; }
