<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE submissao ALTER COLUMN data_submissao TYPE TIMESTAMP USING data_submissao::timestamp');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE submissao ALTER COLUMN data_submissao TYPE DATE USING data_submissao::date');
    }
};
