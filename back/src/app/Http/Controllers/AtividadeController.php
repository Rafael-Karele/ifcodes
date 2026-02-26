<?php

namespace App\Http\Controllers;

use App\Services\ProblemaService;
use App\Models\Atividade;
use App\Models\Submissao;
use App\Lib\Dicionarios\Status;
use App\Support\RealtimeNotifier;
use Exception;
use Illuminate\Http\Request;

/**
 * @OA\Tag(
 *     name="Atividades",
 *     description="Endpoints para gerenciar as atividades (tarefas com prazo)."
 * )
 */
class AtividadeController extends Controller
{
    /**
     * @OA\Get(
     *      path="/api/atividades",
     *      operationId="getAtividadesList",
     *      tags={"Atividades"},
     *      summary="Lista todas as atividades",
     *      description="Retorna uma lista de todas as atividades cadastradas com seus respectivos problemas detalhados, sobre uma turma.",
     *      @OA\Response(
     *          response=200,
     *          description="Operação bem-sucedida",
     *          @OA\JsonContent(
     *              type="array",
     *              @OA\Items(ref="#/components/schemas/AtividadeComProblema")
     *          )
     *      )
     * )
     */
    public function index(Request $request)
    {
        $query = Atividade::query();

        if ($request->filled('turma_id')) {
            $query->where('turma_id', $request->turma_id);
        }

        $atividades = $query->get();

        $userId = auth()->id();
        $acceptedActivityIds = Submissao::where('user_id', $userId)
            ->where('status_correcao_id', Status::ACEITA)
            ->distinct()
            ->pluck('atividade_id')
            ->toArray();

        $atividades->each(function ($atividade) use ($acceptedActivityIds) {
            if (in_array($atividade->id, $acceptedActivityIds)) {
                $atividade->setAttribute('status', 'completed');
            } elseif (now()->greaterThan($atividade->data_entrega)) {
                $atividade->setAttribute('status', 'overdue');
            } else {
                $atividade->setAttribute('status', 'pending');
            }
        });

        return response()->json($atividades);
    }

    public function atividadeDetalhe(Request $request)
    {
        $request->validate([
            'atividade_id' => 'required|integer|exists:atividade,id',
        ]);

        $atividade = Atividade::findOrFail($request->atividade_id);

        $atividade->problema = ProblemaService::buscarPorId($atividade->problema_id);

        return response()->json($atividade);
    }
    /**
     * @OA\Post(
     *      path="/api/atividades",
     *      operationId="storeAtividade",
     *      tags={"Atividades"},
     *      summary="Cria uma nova atividade",
     *      description="Cria uma nova atividade associando um problema e definindo uma data de entrega.",
     *      @OA\RequestBody(
     *          required=true,
     *          description="Dados para a criação da atividade.",
     *          @OA\JsonContent(
     *              required={"data_entrega", "problema_id"},
     *              @OA\Property(property="data_entrega", type="string", format="date-time", example="2024-06-01T23:59:00"),
     *              @OA\Property(property="problema_id", type="integer", example=1)
     *          )
     *      ),
     *      @OA\Response(
     *          response=201,
     *          description="Atividade criada com sucesso",
     *          @OA\JsonContent(ref="#/components/schemas/Atividade")
     *      ),
     *      @OA\Response(response=422, description="Erro de validação dos dados")
     * )
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'data_entrega' => 'required|date',
            'problema_id' => 'required|integer|exists:problema,id',
            'turma_id' => 'required|integer|exists:turma,id',
            'tempo_limite' => 'nullable|integer|min:100|max:10000',
            'memoria_limite' => 'nullable|integer|min:1024|max:256000',
            'compiler_options' => 'nullable|string|max:255',
            'command_line_arguments' => 'nullable|string|max:255',
            'redirect_stderr_to_stdout' => 'nullable|boolean',
            'wall_time_limit' => 'nullable|numeric|min:0.1|max:20',
            'stack_limit' => 'nullable|integer|min:8000|max:128000',
            'max_file_size' => 'nullable|integer|min:64|max:2048',
            'max_processes_and_or_threads' => 'nullable|integer|min:5|max:60',
        ]);

        $atividade = Atividade::create($validated);

        RealtimeNotifier::toTurma($atividade->turma_id, 'activity.created');

        return response()->json($atividade, 201);
    }

    /**
     * @OA\Get(
     *      path="/api/atividades/{atividade}",
     *      operationId="getAtividadeById",
     *      tags={"Atividades"},
     *      summary="Exibe uma atividade específica",
     *      description="Retorna os dados de uma atividade específica.",
     *      @OA\Parameter(
     *          name="atividade",
     *          in="path",
     *          required=true,
     *          description="ID da atividade",
     *          @OA\Schema(type="integer")
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Atividade encontrada",
     *          @OA\JsonContent(ref="#/components/schemas/Atividade")
     *      ),
     *      @OA\Response(
     *          response=404,
     *          description="Atividade não encontrada"
     *      )
     * )
     */
    public function show(Atividade $atividade)
    {
        return response()->json($atividade);
    }

    /**
     * @OA\Put(
     *      path="/api/atividades/{atividade}",
     *      operationId="updateAtividade",
     *      tags={"Atividades"},
     *      summary="Atualiza uma atividade",
     *      description="Atualiza os dados de uma atividade existente.",
     *      @OA\Parameter(name="atividade", in="path", required=true, @OA\Schema(type="integer")),
     *      @OA\RequestBody(
     *          required=true,
     *          description="Dados para atualizar a atividade.",
     *          @OA\JsonContent(
     *              @OA\Property(property="data_entrega", type="string", format="date-time", example="2024-06-01T23:59:00"),
     *              @OA\Property(property="problema_id", type="integer", example=1),
     *              @OA\Property(property="turma_id", type="integer", example=1)
     *          )
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Atividade atualizada com sucesso"
     *      ),
     *      @OA\Response(response=422, description="Erro de validação dos dados")
     * )
     */
    public function update(Request $request, Atividade $atividade)
    {
        $validated = $request->validate([
            'data_entrega' => 'sometimes|required|date',
            'problema_id' => 'sometimes|required|integer|exists:problema,id',
            'turma_id' => 'sometimes|required|integer|exists:turma,id',
            'tempo_limite' => 'nullable|integer|min:100|max:10000',
            'memoria_limite' => 'nullable|integer|min:1024|max:256000',
            'compiler_options' => 'nullable|string|max:255',
            'command_line_arguments' => 'nullable|string|max:255',
            'redirect_stderr_to_stdout' => 'nullable|boolean',
            'wall_time_limit' => 'nullable|numeric|min:0.1|max:20',
            'stack_limit' => 'nullable|integer|min:8000|max:128000',
            'max_file_size' => 'nullable|integer|min:64|max:2048',
            'max_processes_and_or_threads' => 'nullable|integer|min:5|max:60',
        ]);

        $atividade->update($validated);

        RealtimeNotifier::toTurma($atividade->turma_id, 'activity.updated');

        return response()->json($atividade);
    }

    /**
     * @OA\Delete(
     *      path="/api/atividades/{atividade}",
     *      operationId="deleteAtividade",
     *      tags={"Atividades"},
     *      summary="Remove uma atividade",
     *      description="Remove uma atividade do sistema.",
     *      @OA\Parameter(name="atividade", in="path", required=true, @OA\Schema(type="integer")),
     *      @OA\Response(
     *          response=200,
     *          description="Atividade removida com sucesso"
     *      )
     * )
     */
    public function destroy(Atividade $atividade)
    {
        try {
            $turmaId = $atividade->turma_id;
            $atividade->delete();

            RealtimeNotifier::toTurma($turmaId, 'activity.deleted');

            return response()->json([
                'message' => 'Atividade removida com sucesso.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao remover a atividade.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
}
