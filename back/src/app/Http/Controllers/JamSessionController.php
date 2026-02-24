<?php

namespace App\Http\Controllers;

use App\Models\JamSession;
use App\Models\JamParticipant;
use App\Models\Turma;
use App\Services\JamSubmissaoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class JamSessionController extends Controller
{
    public function index(Request $request)
    {
        $request->validate(['turma_id' => 'required|integer|exists:turma,id']);

        $sessions = JamSession::with(['problema', 'professor', 'participants'])
            ->where('turma_id', $request->turma_id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($sessions);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user->hasAnyRole(['professor', 'admin'])) {
            return response()->json(['message' => 'Acesso negado.'], 403);
        }

        $data = $request->validate([
            'turma_id' => 'required|integer|exists:turma,id',
            'problema_id' => 'required|integer|exists:problema,id',
            'titulo' => 'required|string|max:255',
            'instrucoes' => 'nullable|string',
            'tempo_limite' => 'nullable|integer|min:1',
        ]);

        $data['professor_id'] = $user->id;
        $data['status'] = 'waiting';

        $session = JamSession::create($data);
        $session->load(['problema', 'professor', 'participants']);

        return response()->json($session, 201);
    }

    public function update(Request $request, int $id)
    {
        $session = JamSession::find($id);
        if (!$session) {
            return response()->json(['message' => 'Sessão não encontrada.'], 404);
        }

        if ($session->professor_id !== Auth::id()) {
            return response()->json(['message' => 'Apenas o professor da sessão pode editá-la.'], 403);
        }

        $validated = $request->validate([
            'titulo' => 'sometimes|string|max:255',
            'instrucoes' => 'sometimes|nullable|string',
            'tempo_limite' => 'sometimes|nullable|integer|min:1',
        ]);

        $session->update($validated);
        $session->load(['problema', 'participants.user']);

        return response()->json($session);
    }

    public function show(int $id)
    {
        $session = JamSession::with(['problema.casosTeste', 'professor', 'participants.user'])
            ->find($id);

        if (!$session) {
            return response()->json(['message' => 'Sessão não encontrada.'], 404);
        }

        return response()->json($session);
    }

    public function start(Request $request, int $id)
    {
        $session = JamSession::find($id);
        if (!$session) {
            return response()->json(['message' => 'Sessão não encontrada.'], 404);
        }

        if ($session->professor_id !== Auth::id()) {
            return response()->json(['message' => 'Apenas o professor da sessão pode iniciá-la.'], 403);
        }

        if ($session->status !== 'waiting') {
            return response()->json(['message' => 'A sessão não está em estado de espera.'], 422);
        }

        $session->update([
            'status' => 'active',
            'started_at' => now(),
        ]);

        $session->load(['problema', 'participants.user']);

        return response()->json($session);
    }

    public function finish(Request $request, int $id)
    {
        $session = JamSession::find($id);
        if (!$session) {
            return response()->json(['message' => 'Sessão não encontrada.'], 404);
        }

        if ($session->professor_id !== Auth::id()) {
            return response()->json(['message' => 'Apenas o professor da sessão pode encerrá-la.'], 403);
        }

        if ($session->status !== 'active') {
            return response()->json(['message' => 'A sessão não está ativa.'], 422);
        }

        $session->update([
            'status' => 'finished',
            'finished_at' => now(),
        ]);

        $session->load(['problema', 'participants.user']);

        return response()->json($session);
    }

    public function join(Request $request, int $id)
    {
        $session = JamSession::find($id);
        if (!$session) {
            return response()->json(['message' => 'Sessão não encontrada.'], 404);
        }

        if (!in_array($session->status, ['waiting', 'active'])) {
            return response()->json(['message' => 'A sessão já foi encerrada.'], 422);
        }

        $userId = Auth::id();

        // Verifica se o aluno pertence à turma
        $turma = Turma::find($session->turma_id);
        $isEnrolled = $turma->alunos()->where('aluno_id', $userId)->exists();
        $isProfessor = $session->professor_id === $userId;

        if (!$isEnrolled && !$isProfessor) {
            return response()->json(['message' => 'Você não pertence a esta turma.'], 403);
        }

        $participant = JamParticipant::firstOrCreate(
            ['jam_session_id' => $session->id, 'user_id' => $userId],
            ['joined_at' => now(), 'status' => 'joined']
        );

        $participant->load('user');

        return response()->json($participant);
    }

    public function updateCode(Request $request, int $id)
    {
        $request->validate([
            'codigo' => 'required|string',
            'linguagem' => 'nullable|string',
        ]);

        $participant = JamParticipant::where('jam_session_id', $id)
            ->where('user_id', Auth::id())
            ->first();

        if (!$participant) {
            return response()->json(['message' => 'Participante não encontrado.'], 404);
        }

        $updateData = ['codigo' => $request->codigo];
        if ($request->linguagem) {
            $updateData['linguagem'] = $request->linguagem;
        }
        if ($participant->status === 'joined') {
            $updateData['status'] = 'coding';
        }

        $participant->update($updateData);

        return response()->json($participant);
    }

    public function submitCode(Request $request, int $id)
    {
        $session = JamSession::find($id);
        if (!$session) {
            return response()->json(['message' => 'Sessão não encontrada.'], 404);
        }

        if ($session->status !== 'active') {
            return response()->json(['message' => 'A sessão não está ativa.'], 422);
        }

        $participant = JamParticipant::where('jam_session_id', $id)
            ->where('user_id', Auth::id())
            ->first();

        if (!$participant) {
            return response()->json(['message' => 'Participante não encontrado.'], 404);
        }

        if (!$participant->codigo) {
            return response()->json(['message' => 'Nenhum código para submeter.'], 422);
        }

        $service = new JamSubmissaoService();
        $submissao = $service->submit($session, $participant);

        if (!$submissao) {
            return response()->json(['message' => 'Erro ao criar submissão.'], 500);
        }

        return response()->json([
            'message' => 'Código submetido com sucesso.',
            'submissao_id' => $submissao->id,
            'participant' => $participant->fresh(),
        ]);
    }

    public function giveFeedback(Request $request, int $id, int $userId)
    {
        $session = JamSession::find($id);
        if (!$session) {
            return response()->json(['message' => 'Sessão não encontrada.'], 404);
        }

        if ($session->professor_id !== Auth::id()) {
            return response()->json(['message' => 'Apenas o professor pode dar feedback.'], 403);
        }

        $request->validate(['feedback' => 'required|string']);

        $participant = JamParticipant::where('jam_session_id', $id)
            ->where('user_id', $userId)
            ->first();

        if (!$participant) {
            return response()->json(['message' => 'Participante não encontrado.'], 404);
        }

        $feedbacks = $participant->feedback ?? [];
        $feedbacks[] = [
            'message' => $request->feedback,
            'created_at' => now()->toISOString(),
        ];
        $participant->update(['feedback' => $feedbacks]);

        return response()->json($participant);
    }

    public function notifyResult(Request $request)
    {
        $request->validate([
            'jam_session_id' => 'required|integer',
            'user_id' => 'required|integer',
            'status' => 'required|string',
            'test_results' => 'nullable|array',
        ]);

        $participant = JamParticipant::where('jam_session_id', $request->jam_session_id)
            ->where('user_id', $request->user_id)
            ->first();

        if (!$participant) {
            return response()->json(['message' => 'Participante não encontrado.'], 404);
        }

        $statusMap = [
            'passed' => 'passed',
            'failed' => 'failed',
            'error' => 'error',
        ];

        $newStatus = $statusMap[$request->status] ?? 'error';
        $participant->update(['status' => $newStatus]);

        $service = new JamSubmissaoService();
        $service->notifySidecar(
            $request->jam_session_id,
            $request->user_id,
            $newStatus,
            $request->test_results ?? []
        );

        return response()->json(['message' => 'Resultado notificado.']);
    }

    public function activeForTurma(int $turmaId)
    {
        $session = JamSession::with(['problema', 'professor', 'participants.user'])
            ->where('turma_id', $turmaId)
            ->whereIn('status', ['waiting', 'active'])
            ->orderByDesc('created_at')
            ->first();

        if (!$session) {
            return response()->noContent();
        }

        return response()->json($session);
    }
}
