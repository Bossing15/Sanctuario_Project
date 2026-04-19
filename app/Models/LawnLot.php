<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LawnLot extends Model
{
    protected $fillable = [
        'plot_number',
        'grave_location',
        'status',
        'client_id',
        'deceased_name',
        'burial_date',
        'section',
        'relationship_to_deceased',
        'notes',
    ];

    protected $casts = [
        'burial_date' => 'datetime',
    ];
}
