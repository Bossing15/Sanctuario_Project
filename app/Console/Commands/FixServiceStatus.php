<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Service;

class FixServiceStatus extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fix:service-status';

    /**
     * The description of the console command.
     *
     * @var string
     */
    protected $description = 'Fix service status to use lowercase "active" instead of "Active"';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Fixing service status...');

        // Update all services with 'Active' to 'active'
        $updated = Service::where('status', 'Active')->update(['status' => 'active']);

        $this->info('✓ Updated ' . $updated . ' services to use lowercase "active" status');

        // Verify
        $services = Service::all();
        $this->info('');
        $this->info('Services:');
        foreach ($services as $service) {
            $this->info('  - ' . $service->title . ' (status: ' . $service->status . ')');
        }
    }
}
