<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Inquiry;
use App\Models\Booking;
use App\Models\Reservation;
use App\Models\Request;
use App\Models\Payment;

class ClearAllTestData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'clear:all-test-data';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Delete all test requests, inquiries, bookings, reservations, and payments';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if (!$this->confirm('This will delete ALL requests, inquiries, bookings, reservations, and payments. Are you sure?')) {
            $this->info('Operation cancelled.');
            return;
        }

        try {
            $inquiryCount = Inquiry::count();
            $bookingCount = Booking::count();
            $reservationCount = Reservation::count();
            $requestCount = Request::count();
            $paymentCount = Payment::count();

            // Disable foreign key checks
            \DB::statement('SET FOREIGN_KEY_CHECKS=0;');

            Payment::truncate();
            Inquiry::truncate();
            Booking::truncate();
            Reservation::truncate();
            Request::truncate();

            // Re-enable foreign key checks
            \DB::statement('SET FOREIGN_KEY_CHECKS=1;');

            $this->info("✓ Deleted {$inquiryCount} inquiries");
            $this->info("✓ Deleted {$bookingCount} bookings");
            $this->info("✓ Deleted {$reservationCount} reservations");
            $this->info("✓ Deleted {$requestCount} requests");
            $this->info("✓ Deleted {$paymentCount} payments");
            $this->info("\n✓ All test data cleared successfully!");
        } catch (\Exception $e) {
            $this->error('Error clearing test data: ' . $e->getMessage());
        }
    }
}
