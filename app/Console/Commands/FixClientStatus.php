<?php

namespace App\Console\Commands;

use App\Models\Client;
use Illuminate\Console\Command;

class FixClientStatus extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fix:client-status {name?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fix client status from lowercase to Active';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $name = $this->argument('name');

        if ($name) {
            // Fix specific client
            $client = Client::where('name', 'like', "%$name%")->first();
            
            if (!$client) {
                $this->error("Client '$name' not found");
                return 1;
            }

            $oldStatus = $client->status;
            $client->status = 'Active';
            $client->save();

            $this->info("Updated client: {$client->name}");
            $this->info("Old status: $oldStatus");
            $this->info("New status: {$client->status}");
        } else {
            // Fix all clients with lowercase 'active'
            $clients = Client::where('status', 'active')->get();

            if ($clients->isEmpty()) {
                $this->info("No clients with lowercase 'active' status found");
                return 0;
            }

            foreach ($clients as $client) {
                $client->status = 'Active';
                $client->save();
                $this->info("Updated: {$client->name}");
            }

            $this->info("Fixed " . $clients->count() . " clients");
        }

        return 0;
    }
}
