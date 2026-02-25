<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @OA\Schema(
 *     schema="Atividade",
 *     type="object",
 *     title="Atividade Model",
 *     properties={
 *         @OA\Property(property="id", type="integer", readOnly="true", example=1),
 *         @OA\Property(property="data_entrega", type="string", format="date-time", description="Prazo final para a entrega da atividade", example="2024-05-20T23:59:59Z"),
 *         @OA\Property(property="problema_id", type="integer", description="ID do problema associado a esta atividade", example=1),
 *         @OA\Property(property="created_at", type="string", format="date-time", readOnly="true"),
 *         @OA\Property(property="updated_at", type="string", format="date-time", readOnly="true")
 *     }
 * )
 *
 * @OA\Schema(
 *     schema="AtividadeComProblema",
 *     title="Atividade com Problema Detalhado",
 *     description="Representa uma atividade completa com os dados do problema aninhados.",
 *     allOf={
 *         @OA\Schema(ref="#/components/schemas/Atividade"),
 *         @OA\Schema(
 *             type="object",
 *             properties={
 *                 @OA\Property(property="problema", ref="#/components/schemas/Problema")
 *             }
 *         )
 *     }
 * )
 */
class Atividade extends Model
{
    protected $table = 'atividade';
    protected $fillable = [
        'data_entrega',
        'problema_id',
        'turma_id',
        'tempo_limite',
        'memoria_limite',
        'compiler_options',
        'command_line_arguments',
        'redirect_stderr_to_stdout',
        'wall_time_limit',
        'stack_limit',
        'max_file_size',
        'max_processes_and_or_threads',
    ];

    protected $casts = [
        'data_entrega' => 'datetime',
        'redirect_stderr_to_stdout' => 'boolean',
        'wall_time_limit' => 'float',
    ];

    public function problema()
    {
        return $this->hasOne(Problema::class, 'id', 'problema_id');
    }

    public function turma()
    {
        return $this->belongsTo(Turma::class, 'turma_id');
    }

    public function getJudge0Params(): array
    {
        $problema = $this->problema;

        return array_filter([
            'cpu_time_limit'  => min(($this->tempo_limite ?? $problema->tempo_limite) / 1000, 10),
            'memory_limit'    => min($this->memoria_limite ?? $problema->memoria_limite, 256000),
            'compiler_options'             => $this->compiler_options,
            'command_line_arguments'        => $this->command_line_arguments,
            'redirect_stderr_to_stdout'    => $this->redirect_stderr_to_stdout,
            'wall_time_limit'              => min($this->wall_time_limit ?? 10, 20),
            'stack_limit'                  => min($this->stack_limit ?? 64000, 128000),
            'max_file_size'                => min($this->max_file_size ?? 1024, 2048),
            'max_processes_and_or_threads' => min($this->max_processes_and_or_threads ?? 30, 60),
        ], fn ($value) => $value !== null);
    }
}
