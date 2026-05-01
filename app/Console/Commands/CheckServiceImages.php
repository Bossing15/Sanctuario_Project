<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Service;
use App\Models\Property;

class CheckServiceImages extends Command
{
    protected $signature = 'check:images';
    protected $description = 'Check and update service and property images';

    public function handle()
    {
        $this->info('Checking services...');
        $services = Service::all();
        foreach ($services as $service) {
            $this->line("Service ID: {$service->id}, Title: {$service->title}, Image: " . ($service->image_path ?? 'NULL'));
        }

        $this->info('Checking properties...');
        $properties = Property::all();
        foreach ($properties as $property) {
            $this->line("Property ID: {$property->id}, Title: {$property->title}, Image: " . ($property->image_path ?? 'NULL'));
        }

        // Update services
        $this->info('Updating services...');
        Service::where('title', 'Grave Maintenance')->update(['image_path' => 'services/maintenance.jpg']);
        Service::where('title', 'Interment')->update(['image_path' => 'services/interment.jpg']);
        Service::where('title', 'Cremation')->update(['image_path' => 'services/cremation.jpg']);

        // Update properties
        $this->info('Updating properties...');
        Property::where('title', 'Lawn Lots')->update(['image_path' => 'properties/lawn_lots.jpg']);
        Property::where('title', 'Family Estates')->update(['image_path' => 'properties/family_estates.jpg']);
        Property::where('title', 'Columbariums')->update(['image_path' => 'properties/columbariums.jpg']);

        $this->info('Done! Checking again...');
        $services = Service::all();
        foreach ($services as $service) {
            $this->line("Service ID: {$service->id}, Title: {$service->title}, Image: " . ($service->image_path ?? 'NULL'));
        }

        $properties = Property::all();
        foreach ($properties as $property) {
            $this->line("Property ID: {$property->id}, Title: {$property->title}, Image: " . ($property->image_path ?? 'NULL'));
        }
    }
}
