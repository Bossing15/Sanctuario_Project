<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Property extends Model
{
    protected $table = 'products';
    
    protected $fillable = [
        'title',
        'slug',
        'category',
        'description',
        'image_path',
        'gallery_images',
        'price_monthly',
        'price_quarterly',
        'price_yearly',
        'discount_percentage',
        'pricing_title',
        'pricing_subtitle',
        'package_title',
        'package_description',
        'package_note',
        'status'
    ];

    protected $casts = [
        'gallery_images' => 'array'
    ];
}
