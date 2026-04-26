<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Product;
use App\Models\Service;

class CleanupDuplicatesAndOrganize extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cleanup:duplicates-and-organize';

    /**
     * The description of the console command.
     *
     * @var string
     */
    protected $description = 'Clean up duplicate products and services, keeping only the correct ones';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting cleanup of duplicates and organization...');
        $this->info('');

        // Step 1: Keep only the correct products (IDs 2, 3, 4)
        $this->info('Step 1: Cleaning up products...');
        $productsToKeep = [2, 3, 4]; // Lawn Lots, Columbariums, Family Estates
        $productsToDelete = Product::whereNotIn('id', $productsToKeep)->get();

        foreach ($productsToDelete as $product) {
            $this->info('  - Deleting product: ' . $product->title . ' (ID: ' . $product->id . ')');
            $product->delete();
        }

        $this->info('✓ Products cleaned up');
        $this->info('');

        // Step 2: Keep only the correct services (IDs 10, 11, 13, 16, 17)
        $this->info('Step 2: Cleaning up services...');
        $servicesToKeep = [10, 11, 13, 16, 17]; // Interment Service, Cremation Service, Grave Cleaning, Grave Painting, Grave Restoration
        $servicesToDelete = Service::whereNotIn('id', $servicesToKeep)->get();

        foreach ($servicesToDelete as $service) {
            $this->info('  - Deleting service: ' . $service->title . ' (ID: ' . $service->id . ')');
            $service->delete();
        }

        $this->info('✓ Services cleaned up');
        $this->info('');

        // Step 3: Verify the final state
        $this->info('Final Database State:');
        $this->info('');

        $products = Product::orderBy('id')->get();
        $this->info('Products (' . $products->count() . '):');
        foreach ($products as $product) {
            $this->info('  ID ' . $product->id . ': ' . $product->title . ' (slug: ' . $product->slug . ')');
        }

        $this->info('');

        $services = Service::orderBy('id')->get();
        $this->info('Services (' . $services->count() . '):');
        foreach ($services as $service) {
            $this->info('  ID ' . $service->id . ': ' . $service->title . ' (slug: ' . $service->slug . ')');
        }

        $this->info('');
        $this->info('✓ Cleanup completed successfully!');
        $this->info('');
        $this->info('Summary:');
        $this->info('  - Products: 3 (Lawn Lots, Columbariums, Family Estates)');
        $this->info('  - Services: 5 (Interment Service, Cremation Service, Grave Cleaning, Grave Painting, Grave Restoration)');
    }
}
