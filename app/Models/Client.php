<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;

class Client extends Model
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'username',
        'phone',
        'password',
        'status',
        'deceased_name',
        'relationship',
        'date_of_burial',
        'plot_number',
        'grave_location',
        'address',
        'registered_date',
        'last_payment',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'registered_date' => 'datetime',
        'last_payment' => 'datetime',
    ];
}
