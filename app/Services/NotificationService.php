<?php

namespace App\Services;

use App\Models\Request as PurchaseRequest;
use App\Models\Notification;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * Send approval notification to user
     * 
     * @param PurchaseRequest $request
     * @return void
     */
    public function sendApprovalNotification(PurchaseRequest $request): void
    {
        try {
            $productName = $request->product?->title ?? ($request->service?->title ?? 'service');

            // Create notification record
            Notification::create([
                'user_id' => $request->user_id,
                'type' => 'request_approved',
                'title' => 'Your Purchase Request Approved',
                'message' => "Your request for {$productName} has been approved. You can now proceed to payment.",
                'request_id' => $request->id,
                'read_at' => null,
            ]);

            // Send email notification
            $this->sendEmail(
                $request->user->email,
                'Purchase Request Approved',
                "Your request for {$productName} has been approved. You can now proceed to payment."
            );

            Log::info('Approval notification sent', [
                'request_id' => $request->id,
                'user_id' => $request->user_id,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send approval notification', [
                'request_id' => $request->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send rejection notification to user with reason
     * 
     * @param PurchaseRequest $request
     * @param string $reason
     * @return void
     */
    public function sendRejectionNotification(PurchaseRequest $request, string $reason): void
    {
        try {
            $productName = $request->product?->title ?? ($request->service?->title ?? 'service');

            // Create notification record
            Notification::create([
                'user_id' => $request->user_id,
                'type' => 'request_rejected',
                'title' => 'Your Purchase Request Rejected',
                'message' => "Your request for {$productName} has been rejected. Reason: {$reason}",
                'request_id' => $request->id,
                'read_at' => null,
            ]);

            // Send email notification
            $this->sendEmail(
                $request->user->email,
                'Purchase Request Rejected',
                "Your request for {$productName} has been rejected.\n\nReason: {$reason}"
            );

            Log::info('Rejection notification sent', [
                'request_id' => $request->id,
                'user_id' => $request->user_id,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send rejection notification', [
                'request_id' => $request->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send cancellation notification to user
     * 
     * @param PurchaseRequest $request
     * @return void
     */
    public function sendCancellationNotification(PurchaseRequest $request): void
    {
        try {
            $productName = $request->product?->title ?? ($request->service?->title ?? 'service');

            // Create notification record
            Notification::create([
                'user_id' => $request->user_id,
                'type' => 'request_cancelled',
                'title' => 'Purchase Request Cancelled',
                'message' => "Your request for {$productName} has been cancelled.",
                'request_id' => $request->id,
                'read_at' => null,
            ]);

            // Send email notification
            $this->sendEmail(
                $request->user->email,
                'Purchase Request Cancelled',
                "Your request for {$productName} has been cancelled."
            );

            Log::info('Cancellation notification sent', [
                'request_id' => $request->id,
                'user_id' => $request->user_id,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send cancellation notification', [
                'request_id' => $request->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send email helper method
     * 
     * @param string $email
     * @param string $subject
     * @param string $message
     * @return void
     */
    private function sendEmail(string $email, string $subject, string $message): void
    {
        try {
            Mail::raw($message, function ($mail) use ($email, $subject) {
                $mail->to($email)
                    ->subject($subject)
                    ->from(config('mail.from.address', 'noreply@sanctuario.com'));
            });

            Log::info('Email sent', [
                'to' => $email,
                'subject' => $subject,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send email', [
                'to' => $email,
                'subject' => $subject,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
