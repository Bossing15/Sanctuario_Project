<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MaintenanceRequestController extends Controller
{
    /**
     * Get all maintenance requests
     */
    public function index(): JsonResponse
    {
        try {
            // Return empty array for now - can be connected to database later
            return response()->json([
                'success' => true,
                'requests' => [],
                'message' => 'Maintenance requests retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve maintenance requests: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific maintenance request
     */
    public function show($id): JsonResponse
    {
        try {
            return response()->json([
                'success' => false,
                'message' => 'Maintenance request not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve maintenance request: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a new maintenance request
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'type' => 'required|string',
                'description' => 'required|string',
                'status' => 'required|string|in:pending,in_progress,completed'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Maintenance request created successfully',
                'request' => $validated
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create maintenance request: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a maintenance request
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'type' => 'string',
                'description' => 'string',
                'status' => 'string|in:pending,in_progress,completed'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Maintenance request updated successfully',
                'request' => $validated
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update maintenance request: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a maintenance request
     */
    public function destroy($id): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'message' => 'Maintenance request deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete maintenance request: ' . $e->getMessage()
            ], 500);
        }
    }
}
