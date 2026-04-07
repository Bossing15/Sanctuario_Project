<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule automated payment reminders - runs daily at 9 AM
Schedule::command('payments:send-reminders')->dailyAt('09:00');

// Schedule overdue payment checks - runs daily at 10 AM
Schedule::command('payments:check-overdue')->dailyAt('10:00');
