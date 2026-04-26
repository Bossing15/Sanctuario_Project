<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Inquiry;

class GenerateInvoiceNumbers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'inquiries:generate-invoice-numbers';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate invoice numbers for all inquiries that don\'t have one';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $inquiries = Inquiry::whereNull('invoice_number')->get();
        
        $count = 0;
        foreach ($inquiries as $inquiry) {
            $inquiry->update([
                'invoice_number' => 'SANC-' . $inquiry->id . '-' . substr($inquiry->created_at->timestamp, -6)
            ]);
            $count++;
        }

        $this->info("Generated invoice numbers for {$count} inquiries");
    }
}
