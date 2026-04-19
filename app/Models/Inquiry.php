<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
        'maintenance_photos'
    ];
}
