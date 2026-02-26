<?php

use App\Http\Controllers\AtividadeController;
use App\Http\Controllers\CorrecaoController;
use App\Http\Controllers\CursoController;
use App\Http\Controllers\ProblemaController;
use App\Http\Controllers\SubmissaoController;
use App\Http\Controllers\ProfessorController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\ForgotPasswordTempController; 
use App\Http\Controllers\AlunoController;
use App\Http\Controllers\TurmaController;
use App\Http\Controllers\JamSessionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Todas as rotas da API exigem autenticação via Sanctum
Route::middleware('auth:sanctum')->group(function () {

    // Rotas de informações do usuário autenticado
    Route::get('/user', [AuthController::class, 'user']);
    Route::patch('/user', [AuthController::class, 'update']);
    Route::get('/user/roles', [AuthController::class, 'roles']);
    Route::get('/user/permissions', [AuthController::class, 'permissions']);
    Route::post('/user/change-password', [AuthController::class, 'changePassword']);

    // ── Rotas acessíveis por qualquer usuário autenticado ──

    Route::apiResource('atividades', AtividadeController::class)->only(['index', 'show']);
    Route::apiResource('turmas', TurmaController::class)->only(['index', 'show']);
    Route::get('/turmas/{turma_id}/listar-alunos', [TurmaController::class, 'listarAlunos']);
    Route::get('/cursos', [CursoController::class, 'index']);

    Route::apiResource('problemas', ProblemaController::class)->only(['index', 'show']);
    Route::get('/submissoes/atividades/{atividade}', [SubmissaoController::class, 'getSubmissionByUser']);
    Route::apiResource('submissoes', SubmissaoController::class)
        ->only(['index', 'show', 'store'])
        ->parameters(['submissoes' => 'submissao']);

    Route::get('/correcao/busca-por-submissao/{submissao}', [CorrecaoController::class, 'buscaPorSubmissao']);

    // Jam Sessions — rotas de participação (qualquer autenticado)
    Route::get('/jam-sessions', [JamSessionController::class, 'index']);
    Route::get('/jam-sessions/{id}', [JamSessionController::class, 'show']);
    Route::post('/jam-sessions/{id}/join', [JamSessionController::class, 'join']);
    Route::put('/jam-sessions/{id}/code', [JamSessionController::class, 'updateCode']);
    Route::post('/jam-sessions/{id}/submit', [JamSessionController::class, 'submitCode']);
    Route::get('/turmas/{id}/jam-session/active', [JamSessionController::class, 'activeForTurma']);

    // ── Rotas restritas a professor e admin ──

    Route::middleware('role:professor|admin')->group(function () {
        Route::apiResource('atividades', AtividadeController::class)->only(['store', 'update', 'destroy']);
        Route::apiResource('problemas', ProblemaController::class)->only(['store', 'update', 'destroy']);
        Route::apiResource('turmas', TurmaController::class)->only(['store', 'update', 'destroy']);
        Route::apiResource('alunos', AlunoController::class)->only(['index', 'show']);
        Route::post('/turmas/{turma_id}/vincular-aluno/{aluno_id}', [TurmaController::class, 'vincularAluno']);
        Route::delete('/turmas/{turma_id}/desvincular-aluno/{aluno_id}', [TurmaController::class, 'desvincularAluno']);
        Route::get('/turmas/{turma_id}/atividades/{atividade_id}/submissoes', [SubmissaoController::class, 'getSubmissionsByActivity']);

        // Jam Sessions — rotas de gestão (professor/admin)
        Route::post('/jam-sessions', [JamSessionController::class, 'store']);
        Route::put('/jam-sessions/{id}', [JamSessionController::class, 'update']);
        Route::post('/jam-sessions/{id}/start', [JamSessionController::class, 'start']);
        Route::post('/jam-sessions/{id}/finish', [JamSessionController::class, 'finish']);
        Route::put('/jam-sessions/{id}/feedback/{userId}', [JamSessionController::class, 'giveFeedback']);
        Route::post('/jam-sessions/notify-result', [JamSessionController::class, 'notifyResult']);
    });

    // ── Rotas restritas a admin ──

    Route::middleware('role:admin')->group(function () {
        Route::apiResource('alunos', AlunoController::class)->only(['store', 'update', 'destroy']);
        Route::apiResource('professores', ProfessorController::class)
            ->parameters(['professores' => 'professor']);
    });
});

// Rota pública para recuperação de senha (fora do middleware auth:sanctum)
Route::post('/forgot-password-temp', [ForgotPasswordTempController::class, 'sendTempPassword']);
