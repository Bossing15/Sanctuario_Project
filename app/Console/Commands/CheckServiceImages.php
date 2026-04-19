<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Service;
use App\Models\Product;

class CheckServiceImages extends Command
{
    protected $signature = 'check:images';
    protected $description = 'Check and update service and product images';

    public function handle()
    {
        $this->info('Checking services...');
        $services = Service::all();
        foreach ($services as $service) {
            $this->line("Service ID: {$service->id}, Title: {$service->title}, Image: " . ($service->image_path ?? 'NULL'));
        }

        $this->info('Checking products...');
        $products = Product::all();
        foreach ($products as $product) {
            $this->line("Product ID: {$product->id}, Title: {$product->title}, Image: " . ($product->image_path ?? 'NULL'));
        }

        // Update services
        $this->info('Updating services...');
        Service::where('title', 'Grave Maintenance')->update(['image_path' => 'services/maintenance.jpg']);
        Service::where('title', 'Interment')->update(['image_path' => 'services/interment.jpg']);
        Service::where('title', 'Cremation')->update(['image_path' => 'services/cremation.jpg']);

        // Update products
        $this->info('Updating products...');
        Product::where('title', 'Lawn Lots')->update(['image_path' => 'products/lawn_lots.jpg']);
        Product::where('title', 'Family Estates')->update(['image_path' => 'products/family_estates.jpg']);
        Product::where('title', 'Columbariums')->update(['image_path' => 'products/columbariums.jpg']);

        $this->info('Done! Checking again...');
        $services = Service::all();
        foreach ($services as $service) {
            $this->line("Service ID: {$service->id}, Title: {$service->title}, Image: " . ($service->image_path ?? 'NULL'));
        }

        $products = Product::all();
        foreach ($products as $product) {
            $this->line("Product ID: {$product->id}, Title: {$product->title}, Image: " . ($product->image_path ?? 'NULL'));
        }
    }
}
