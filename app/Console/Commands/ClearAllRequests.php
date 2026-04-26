<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Inquiry;
use App\Models\Payment;
use App\Models\Reservation;
use Illuminate\Support\Facades\DB;

class ClearAllRequests extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'requests:clear-all';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clear all inquiries, payments, and reservations';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if (!$this->confirm('Are you sure you want to delete ALL inquiries, payments, and reservations? This cannot be undone!')) {
            $this->info('Operation cancelled.');
            return;
        }

        // Disable foreign key checks temporarily
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        $inquiryCount = Inquiry::count();
        $paymentCount = Payment::count();
        $reservationCount = Reservation::count();

        Inquiry::truncate();
        Payment::truncate();
        Reservation::truncate();

        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        $this->info("Deleted {$inquiryCount} inquiries");
        $this->info("Deleted {$paymentCount} payments");
        $this->info("Deleted {$reservationCount} reservations");
        $this->info('All requests have been cleared!');
    }
}
