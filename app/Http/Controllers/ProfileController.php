<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function getProfile(Request $request)
    {
        try {
            $user = $request->user();
            
            return response()->json([
                'profile' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function uploadProfilePicture(Request $request)
    {
        try {
            $validated = $request->validate([
                'picture' => 'required|image|max:5120',
            ]);

            $user = $request->user();
            
            if ($request->hasFile('picture')) {
                $path = $request->file('picture')->store('profiles', 'public');
                $user->update(['profile_picture' => $path]);
            }

            return response()->json([
                'message' => 'Profile picture uploaded successfully',
                'user' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to upload profile picture',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function deleteProfilePicture(Request $request)
    {
        try {
            $user = $request->user();
            $user->update(['profile_picture' => null]);

            return response()->json([
                'message' => 'Profile picture deleted successfully',
                'user' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete profile picture',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update user profile (name, email, password)
     */
    public function updateProfile(Request $request)
    {
        try {
            $user = $request->user();

            $validated = $request->validate([
                'name' => 'nullable|string|max:255',
                'email' => 'nullable|email|unique:admins,email,' . $user->id,
                'current_password' => 'nullable|string',
                'new_password' => 'nullable|string|min:6|confirmed',
            ]);

            // Update name if provided
            if (!empty($validated['name'])) {
                $user->name = $validated['name'];
            }

            // Update email if provided
            if (!empty($validated['email'])) {
                $user->email = $validated['email'];
            }

            // Update password if provided
            if (!empty($validated['new_password'])) {
                // Verify current password
                if (empty($validated['current_password'])) {
                    return response()->json([
                        'message' => 'Current password is required to change password',
                        'error' => 'current_password_required'
                    ], 422);
                }

                if (!\Illuminate\Support\Facades\Hash::check($validated['current_password'], $user->password)) {
                    return response()->json([
                        'message' => 'Current password is incorrect',
                        'error' => 'invalid_current_password'
                    ], 422);
                }

                $user->password = $validated['new_password'];
            }

            $user->save();

            return response()->json([
                'message' => 'Profile updated successfully',
                'user' => $user
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
