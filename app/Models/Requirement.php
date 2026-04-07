<?php namespace App\Models; use Illuminate\Database\Eloquent\Model; class Requirement extends Model { protected $fillable = ['service_id', 'name', 'description', 'is_required']; }
