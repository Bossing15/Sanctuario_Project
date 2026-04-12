<?php

namespace App\Http\Controllers;

use App\Models\SiteSetting;
use Illuminate\Http\Request;

class SiteSettingController extends Controller
{
    public function getPublicSettings()
    {
        try {
            $settings = SiteSetting::all();
            $settingsArray = [];
            
            foreach ($settings as $setting) {
                $settingsArray[$setting->key] = $setting->value;
            }

            return response()->json([
                'settings' => $settingsArray
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function index()
    {
        try {
            $settings = SiteSetting::all();
            
            // Organize settings by category
            $organizedSettings = [];
            foreach ($settings as $setting) {
                $category = $setting->category ?? 'general';
                if (!isset($organizedSettings[$category])) {
                    $organizedSettings[$category] = [];
                }
                $organizedSettings[$category][$setting->key] = [
                    'label' => $setting->label ?? ucfirst(str_replace('_', ' ', $setting->key)),
                    'description' => $setting->description ?? '',
                    'type' => $setting->type ?? 'text',
                    'value' => $setting->value,
                    'is_active' => $setting->is_active ?? true,
                ];
            }
            
            return response()->json([
                'settings' => $organizedSettings,
                'count' => $settings->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateSettings(Request $request)
    {
        try {
            $validated = $request->validate([
                'settings' => 'required|array',
            ]);

            foreach ($validated['settings'] as $key => $value) {
                SiteSetting::updateOrCreate(
                    ['key' => $key],
                    ['value' => $value]
                );
            }

            return response()->json([
                'message' => 'Settings updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function uploadImage(Request $request)
    {
        try {
            $validated = $request->validate([
                'image' => 'required|image|max:5120',
                'key' => 'required|string',
            ]);

            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('settings', 'public');
                SiteSetting::updateOrCreate(
                    ['key' => $validated['key']],
                    ['value' => $path]
                );

                return response()->json([
                    'message' => 'Image uploaded successfully',
                    'path' => $path
                ]);
            }

            return response()->json([
                'message' => 'No image file provided'
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to upload image',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function initializeDefaults()
    {
        try {
            $defaults = [
                'site_name' => 'Sanctuario',
                'site_email' => '[email]',
                'site_phone' => '[phone_number]',
                'site_address' => '[address]',
                'site_description' => 'Memorial and Burial Services',
            ];

            foreach ($defaults as $key => $value) {
                SiteSetting::updateOrCreate(
                    ['key' => $key],
                    ['value' => $value]
                );
            }

            return response()->json([
                'message' => 'Default settings initialized'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to initialize settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
