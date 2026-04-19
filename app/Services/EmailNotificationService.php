<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Admin;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class EmailNotificationService
{
    /**
     * Send email notification when authorization request is pending
     * Notifies admin that a new authorization request needs review
     * 
     * @param Booking $booking
     * @return bool
     */
    public function notifyAdminPendingRequest(Booking $booking): bool
    {
        try {
            // Get all admins with billing/authorization permissions
            $admins = Admin::where('is_active', true)
                ->where(function($query) {
                    $query->where('access_level', 'admin')
                        ->orWhere('access_level', 'staff');
                })
                ->get();

            if ($admins->isEmpty()) {
                Log::warning('No active admins found to notify about pending authorization');
                return false;
            }

            $customer = $booking->user;
            $itemName = $booking->product ? $booking->product->title : ($booking->service ? $booking->service->title : 'Item');

            foreach ($admins as $admin) {
                $subject = "New Authorization Request - {$itemName}";
                $message = "A new authorization request requires your review.\n\n";
                $message .= "Customer: {$customer->name}\n";
                $message .= "Email: {$customer->email}\n";
                $message .= "Phone: {$customer->phone}\n";
                $message .= "Item: {$itemName}\n";
                $message .= "Amount: PHP " . number_format($booking->amount, 2) . "\n";
                $message .= "Booking Date: {$booking->booking_date}\n\n";
                $message .= "Please log in to the admin dashboard to review and approve/reject this request.";

                $this->sendEmail($admin->email, $subject, $message);
            }

            Log::info('Admin notification sent for pending authorization', [
                'booking_id' => $booking->id,
                'admins_notified' => $admins->count()
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to send admin pending notification', [
                'booking_id' => $booking->id,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Send email notification when authorization is approved
     * Notifies customer that their request has been approved
     * 
     * @param Booking $booking
     * @return bool
     */
    public function notifyCustomerApproved(Booking $booking): bool
    {
        try {
            $customer = $booking->user;
            if (!$customer || !$customer->email) {
                Log::warning('Customer email not found for approval notification', [
                    'booking_id' => $booking->id
                ]);
                return false;
            }

            $itemName = $booking->product ? $booking->product->title : ($booking->service ? $booking->service->title : 'Item');
            $approver = $booking->approver;

            $subject = "Your Authorization Request Has Been Approved";
            $message = "Dear {$customer->name},\n\n";
            $message .= "Good news! Your authorization request has been approved.\n\n";
            $message .= "Details:\n";
            $message .= "Item: {$itemName}\n";
            $message .= "Amount: PHP " . number_format($booking->amount, 2) . "\n";
            $message .= "Approved By: " . ($approver ? $approver->name : 'Admin') . "\n";
            $message .= "Approved Date: " . ($booking->approved_at ? $booking->approved_at->format('F d, Y H:i A') : 'N/A') . "\n\n";
            $message .= "You can now proceed with payment. Please log in to your account to complete the payment process.\n\n";
            $message .= "Thank you for choosing our services.";

            $this->sendEmail($customer->email, $subject, $message);

            Log::info('Customer approval notification sent', [
                'booking_id' => $booking->id,
                'customer_id' => $customer->id
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to send customer approval notification', [
                'booking_id' => $booking->id,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Send email notification when authorization is rejected
     * Notifies customer that their request has been rejected with reason
     * 
     * @param Booking $booking
     * @return bool
     */
    public function notifyCustomerRejected(Booking $booking): bool
    {
        try {
            $customer = $booking->user;
            if (!$customer || !$customer->email) {
                Log::warning('Customer email not found for rejection notification', [
                    'booking_id' => $booking->id
                ]);
                return false;
            }

            $itemName = $booking->product ? $booking->product->title : ($booking->service ? $booking->service->title : 'Item');

            $subject = "Your Authorization Request Has Been Rejected";
            $message = "Dear {$customer->name},\n\n";
            $message .= "We regret to inform you that your authorization request has been rejected.\n\n";
            $message .= "Details:\n";
            $message .= "Item: {$itemName}\n";
            $message .= "Amount: PHP " . number_format($booking->amount, 2) . "\n";
            $message .= "Reason: " . ($booking->rejection_reason ?? 'No reason provided') . "\n\n";
            $message .= "If you believe this is an error or would like to discuss this further, please contact our customer service team.\n\n";
            $message .= "Thank you for your understanding.";

            $this->sendEmail($customer->email, $subject, $message);

            Log::info('Customer rejection notification sent', [
                'booking_id' => $booking->id,
                'customer_id' => $customer->id
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to send customer rejection notification', [
                'booking_id' => $booking->id,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Generic email sending method
     * 
     * @param string $to
     * @param string $subject
     * @param string $message
     * @return bool
     */
    private function sendEmail(string $to, string $subject, string $message): bool
    {
        try {
            // Using Laravel's Mail facade
            // This assumes you have mail configured in your .env file
            Mail::raw($message, function ($mail) use ($to, $subject) {
                $mail->to($to)
                    ->subject($subject)
                    ->from(config('mail.from.address', 'noreply@sanctuario.com'));
            });

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to send email', [
                'to' => $to,
                'subject' => $subject,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
}
