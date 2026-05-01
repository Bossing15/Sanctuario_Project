<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Property;
use App\Models\Service;

class CleanupProductsAndServices extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cleanup:products-services';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up old/duplicate products and services, keeping only the correct ones';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting cleanup of products and services...');

        // Keep only these product IDs: 2 (Lawn Lots), 3 (Columbariums), 4 (Family Estates)
        $productsToKeep = [2, 3, 4];
        $productsToDelete = Property::whereNotIn('id', $productsToKeep)->get();
        
        $this->info("Deleting " . $productsToDelete->count() . " old/duplicate products...");
        foreach ($productsToDelete as $product) {
            $this->line("  - Deleting Product ID {$product->id}: {$product->title}");
            $product->delete();
        }

        // Keep only these service IDs: 10 (Interment Service), 11 (Cremation Service), 13 (Grave Cleaning), 16 (Grave Painting), 17 (Grave Restoration)
        $servicesToKeep = [10, 11, 13, 16, 17];
        $servicesToDelete = Service::whereNotIn('id', $servicesToKeep)->get();
        
        $this->info("Deleting " . $servicesToDelete->count() . " old/duplicate services...");
        foreach ($servicesToDelete as $service) {
            $this->line("  - Deleting Service ID {$service->id}: {$service->title}");
            $service->delete();
        }

        $this->info('Cleanup completed successfully!');
        $this->info('Remaining products: ' . Property::count());
        $this->info('Remaining services: ' . Service::count());
    }
}
