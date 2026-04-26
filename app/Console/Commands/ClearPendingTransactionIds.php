<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Payment;

class ClearPendingTransactionIds extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'payments:clear-pending-transaction-ids';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clear transaction IDs for all pending payments';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $updated = Payment::where('status', 'pending')
            ->orWhere('status', 'overdue')
            ->update(['transaction_id' => null]);

        $this->info("Cleared transaction_id for {$updated} pending/overdue payments");
    }
}
