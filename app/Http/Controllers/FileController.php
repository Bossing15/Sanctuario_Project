<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Response;

class FileController extends Controller
{
    /**
     * Serve files from storage
     * GET /api/files/{path}
     */
    public function serve($path)
    {
        try {
            // Prevent directory traversal attacks
            if (strpos($path, '..') !== false || strpos($path, '//') !== false) {
                return response()->json(['message' => 'Invalid file path'], 400);
            }

            // Check if file exists in public storage
            if (!Storage::disk('public')->exists($path)) {
                return response()->json(['message' => 'File not found'], 404);
            }

            // Get file content
            $fileContent = Storage::disk('public')->get($path);
            
            // Determine MIME type
            $mimeType = Storage::disk('public')->mimeType($path);
            
            // Return file with appropriate headers
            return response($fileContent, 200)
                ->header('Content-Type', $mimeType)
                ->header('Content-Disposition', 'inline; filename="' . basename($path) . '"')
                ->header('Cache-Control', 'public, max-age=3600');
        } catch (\Exception $e) {
            \Log::error('File serving error', [
                'path' => $path,
                'error' => $e->getMessage(),
            ]);
            return response()->json(['message' => 'Failed to serve file'], 500);
        }
    }
}
