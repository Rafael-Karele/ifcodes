<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Clear any non-JSON feedback values first
        DB::table('jam_participants')
            ->whereNotNull('feedback')
            ->update(['feedback' => null]);

        DB::statement('ALTER TABLE jam_participants ALTER COLUMN feedback TYPE json USING feedback::json');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE jam_participants ALTER COLUMN feedback TYPE text USING feedback::text');
    }
};
