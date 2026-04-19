<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Columbarium extends Model
{
    protected $table = 'columbaria';

    protected $fillable = [
        'niche_number',
        'location',
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
