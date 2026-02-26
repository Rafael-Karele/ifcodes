<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('atividade', function (Blueprint $table) {
            $table->foreignId('turma_id')->nullable()->constrained('turma')->onDelete('cascade')->after('id');
        });

        DB::statement('ALTER TABLE atividade ALTER COLUMN data_entrega TYPE TIMESTAMP USING data_entrega::timestamp');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('atividade', function (Blueprint $table) {
            $table->dropForeign(['turma_id']);
            $table->dropColumn(['turma_id']);
        });

        DB::statement('ALTER TABLE atividade ALTER COLUMN data_entrega TYPE DATE USING data_entrega::date');
    }
};
