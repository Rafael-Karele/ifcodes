<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jam_sessions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('turma_id');
            $table->unsignedBigInteger('problema_id');
            $table->unsignedBigInteger('professor_id');
            $table->string('titulo');
            $table->text('instrucoes')->nullable();
            $table->integer('tempo_limite')->nullable();
            $table->enum('status', ['waiting', 'active', 'finished'])->default('waiting');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->timestamps();

            $table->foreign('turma_id')->references('id')->on('turma')->onDelete('cascade');
            $table->foreign('problema_id')->references('id')->on('problema')->onDelete('cascade');
            $table->foreign('professor_id')->references('id')->on('professor')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jam_sessions');
    }
};
