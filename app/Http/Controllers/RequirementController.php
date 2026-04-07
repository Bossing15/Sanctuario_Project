<?php

namespace App\Http\Controllers;

use App\Models\Requirement;
use App\Models\RequirementSubmission;
use Illuminate\Http\Request;

class RequirementController extends Controller
{
    public function getServiceRequirements($serviceId)
    {
        try {
            $requirements = Requirement::where('service_id', $serviceId)->get();
            
            return response()->json([
                'requirements' => $requirements,
                'count' => $requirements->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch requirements',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function submitRequirements($bookingId, Request $request)
    {
        try {
            $validated = $request->validate([
                'requirements' => 'required|array',
                'requirements.*.requirement_id' => 'required|integer',
                'requirements.*.value' => 'required|string',
            ]);

            $submissions = [];
            foreach ($validated['requirements'] as $req) {
                $submission = RequirementSubmission::create([
                    'booking_id' => $bookingId,
                    'requirement_id' => $req['requirement_id'],
                    'value' => $req['value'],
                    'status' => 'pending'
                ]);
                $submissions[] = $submission;
            }

            return response()->json([
                'message' => 'Requirements submitted successfully',
                'submissions' => $submissions
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to submit requirements',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getAllRequirements()
    {
        try {
            $requirements = Requirement::all();
            
            return response()->json([
                'requirements' => $requirements,
                'count' => $requirements->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch requirements',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getBookingSubmissions($bookingId)
    {
        try {
            $submissions = RequirementSubmission::where('booking_id', $bookingId)->get();
            
            return response()->json([
                'submissions' => $submissions,
                'count' => $submissions->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch submissions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function createRequirement(Request $request)
    {
        try {
            $validated = $request->validate([
                'service_id' => 'required|integer',
                'name' => 'required|string',
                'description' => 'nullable|string',
                'is_required' => 'required|boolean',
                'field_type' => 'required|string',
            ]);

            $requirement = Requirement::create($validated);

            return response()->json([
                'message' => 'Requirement created successfully',
                'requirement' => $requirement
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create requirement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateRequirement($id, Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'nullable|string',
                'description' => 'nullable|string',
                'is_required' => 'nullable|boolean',
                'field_type' => 'nullable|string',
            ]);

            $requirement = Requirement::findOrFail($id);
            $requirement->update($validated);

            return response()->json([
                'message' => 'Requirement updated successfully',
                'requirement' => $requirement
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update requirement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function deleteRequirement($id)
    {
        try {
            $requirement = Requirement::findOrFail($id);
            $requirement->delete();

            return response()->json([
                'message' => 'Requirement deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete requirement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function assignRequirements($serviceId, Request $request)
    {
        try {
            $validated = $request->validate([
                'requirements' => 'required|array',
            ]);

            return response()->json([
                'message' => 'Requirements assigned successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to assign requirements',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function reviewSubmission($submissionId, Request $request)
    {
        try {
            $validated = $request->validate([
                'status' => 'required|string',
                'notes' => 'nullable|string',
            ]);

            $submission = RequirementSubmission::findOrFail($submissionId);
            $submission->update($validated);

            return response()->json([
                'message' => 'Submission reviewed successfully',
                'submission' => $submission
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to review submission',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
