<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Request;

class GenerateRequestInvoiceNumbers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'requests:generate-invoice-numbers';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate invoice numbers for all requests that don\'t have one';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $requests = Request::whereNull('invoice_number')->get();
        
        $count = 0;
        foreach ($requests as $request) {
            $request->update([
                'invoice_number' => 'SANC-' . $request->id . '-' . substr($request->created_at->timestamp, -6)
            ]);
            $count++;
        }

        $this->info("Generated invoice numbers for {$count} requests");
    }
}
