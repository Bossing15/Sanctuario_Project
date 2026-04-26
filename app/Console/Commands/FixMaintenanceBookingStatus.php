<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Booking;
use App\Models\Service;

class FixMaintenanceBookingStatus extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:fix-maintenance-booking-status';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fix maintenance booking statuses to be PendingReview instead of ReadyForPayment';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Get all maintenance services
        $maintenanceServices = Service::where('category', 'Grave Maintenance')->pluck('id');
        
        if ($maintenanceServices->isEmpty()) {
            $this->info('No maintenance services found.');
            return;
        }

        // Find all bookings with maintenance services that have PENDING_AUTHORIZATION status
        $bookings = Booking::whereIn('service_id', $maintenanceServices)
            ->where('authorization_status', 'PENDING_AUTHORIZATION')
            ->where('status', 'ReadyForPayment')
            ->get();

        if ($bookings->isEmpty()) {
            $this->info('No maintenance bookings to fix.');
            return;
        }

        $count = 0;
        foreach ($bookings as $booking) {
            $booking->update(['status' => 'PendingReview']);
            $count++;
        }

        $this->info("Fixed {$count} maintenance booking(s) status from 'ReadyForPayment' to 'PendingReview'.");
    }
}
