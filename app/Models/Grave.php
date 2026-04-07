<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Grave extends Model
{
    protected $fillable = [
        'plot_number',
        'location',
        'status',
        'client_id',
        'deceased_name',
        'date_of_burial',
    ];

    protected $casts = [
        'date_of_burial' => 'datetime',
    ];
}
