<?php

namespace App\Traits;

use Illuminate\Http\Request;

trait FormSubmissionTrait
{
    /**
     * Handle form submission creation
     */
    protected function handleSubmit(Request $request, $modelClass, $validationRules)
    {
        try {
            $validated = $request->validate($validationRules);
            $record = $modelClass::create($validated);

            return response()->json([
                'message' => 'Submission successful',
                'data' => $record
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to submit',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handle status update
     */
    protected function handleStatusUpdate(Request $request, $model)
    {
        try {
            $validated = $request->validate([
                'status' => 'required|string'
            ]);

            $model->update(['status' => $validated['status']]);

            return response()->json([
                'message' => 'Status updated successfully',
                'data' => $model
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handle record deletion
     */
    protected function handleDelete($model)
    {
        try {
            $model->delete();

            return response()->json([
                'message' => 'Record deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete record',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
