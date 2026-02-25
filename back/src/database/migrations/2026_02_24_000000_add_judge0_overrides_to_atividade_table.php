<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('atividade', function (Blueprint $table) {
            $table->integer('tempo_limite')->nullable();
            $table->integer('memoria_limite')->nullable();
            $table->string('compiler_options')->nullable();
            $table->string('command_line_arguments')->nullable();
            $table->boolean('redirect_stderr_to_stdout')->nullable();
            $table->float('wall_time_limit')->nullable();
            $table->integer('stack_limit')->nullable();
            $table->integer('max_file_size')->nullable();
            $table->integer('max_processes_and_or_threads')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('atividade', function (Blueprint $table) {
            $table->dropColumn([
                'tempo_limite',
                'memoria_limite',
                'compiler_options',
                'command_line_arguments',
                'redirect_stderr_to_stdout',
                'wall_time_limit',
                'stack_limit',
                'max_file_size',
                'max_processes_and_or_threads',
            ]);
        });
    }
};
