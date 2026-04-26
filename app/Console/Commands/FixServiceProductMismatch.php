<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Product;
use App\Models\Service;

class FixServiceProductMismatch extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fix:service-product-mismatch';

    /**
     * The description of the console command.
     *
     * @var string
     */
    protected $description = 'Move Interment and Cremation from products table to services table';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting to fix service/product mismatch...');

        // Get Interment and Cremation from products table
        $interment = Product::where('slug', 'interment')->first();
        $cremation = Product::where('slug', 'cremation')->first();

        if (!$interment && !$cremation) {
            $this->info('No Interment or Cremation products found. Database may already be correct.');
            return;
        }

        // Create Interment service if it doesn't exist
        if ($interment) {
            $existingIntermentService = Service::where('slug', 'interment')->first();
            if (!$existingIntermentService) {
                Service::create([
                    'title' => $interment->title,
                    'slug' => $interment->slug,
                    'description' => $interment->description,
                    'category' => 'Burial Services',
                    'price_monthly' => $interment->price_monthly,
                    'price_quarterly' => $interment->price_quarterly,
                    'price_yearly' => $interment->price_yearly,
                    'status' => 'Active',
                ]);
                $this->info('✓ Created Interment service');
            } else {
                $this->info('✓ Interment service already exists');
            }

            // Delete Interment from products
            $interment->delete();
            $this->info('✓ Deleted Interment from products');
        }

        // Create Cremation service if it doesn't exist
        if ($cremation) {
            $existingCremationService = Service::where('slug', 'cremation')->first();
            if (!$existingCremationService) {
                Service::create([
                    'title' => $cremation->title,
                    'slug' => $cremation->slug,
                    'description' => $cremation->description,
                    'category' => 'Burial Services',
                    'price_monthly' => $cremation->price_monthly,
                    'price_quarterly' => $cremation->price_quarterly,
                    'price_yearly' => $cremation->price_yearly,
                    'status' => 'Active',
                ]);
                $this->info('✓ Created Cremation service');
            } else {
                $this->info('✓ Cremation service already exists');
            }

            // Delete Cremation from products
            $cremation->delete();
            $this->info('✓ Deleted Cremation from products');
        }

        // Verify the final state
        $products = Product::all();
        $services = Service::all();

        $this->info('');
        $this->info('Final Database State:');
        $this->info('Products: ' . $products->count());
        foreach ($products as $product) {
            $this->info('  - ' . $product->title . ' (ID: ' . $product->id . ')');
        }

        $this->info('Services: ' . $services->count());
        foreach ($services as $service) {
            $this->info('  - ' . $service->title . ' (ID: ' . $service->id . ')');
        }

        $this->info('');
        $this->info('✓ Service/Product mismatch fixed successfully!');
    }
}
