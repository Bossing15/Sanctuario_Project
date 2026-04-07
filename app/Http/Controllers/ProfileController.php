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
}
