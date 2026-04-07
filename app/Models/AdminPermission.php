<?php namespace App\Models; use Illuminate\Database\Eloquent\Model; class AdminPermission extends Model { protected $fillable = ['admin_id', 'permission_key', 'can_perform_actions']; }
