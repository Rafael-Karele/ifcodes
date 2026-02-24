<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jam_participants', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('jam_session_id');
            $table->unsignedBigInteger('user_id');
            $table->text('codigo')->nullable();
            $table->string('linguagem')->default('c');
            $table->enum('status', ['joined', 'coding', 'submitted', 'passed', 'failed', 'error'])->default('joined');
            $table->unsignedBigInteger('submissao_id')->nullable();
            $table->text('feedback')->nullable();
            $table->timestamp('joined_at')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();

            $table->foreign('jam_session_id')->references('id')->on('jam_sessions')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('submissao_id')->references('id')->on('submissao')->nullOnDelete();
            $table->unique(['jam_session_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jam_participants');
    }
};
