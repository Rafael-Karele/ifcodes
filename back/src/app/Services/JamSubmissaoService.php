<?php

namespace App\Services;

use App\Jobs\SubmissionJob;
use App\Models\JamParticipant;
use App\Models\JamSession;
use App\Models\Submissao;
use App\Lib\Dicionarios\Status;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class JamSubmissaoService
{
    private const LINGUAGEM_C = 50;

    public function submit(JamSession $session, JamParticipant $participant): ?Submissao
    {
        $submissao = Submissao::create([
            'data_submissao' => Date::now(),
            'codigo' => $participant->codigo,
            'linguagem' => self::LINGUAGEM_C,
            'atividade_id' => $session->problema->atividades()->first()?->id,
            'user_id' => $participant->user_id,
            'status_correcao_id' => Status::NA_FILA,
        ]);

        if (!$submissao) {
            return null;
        }

        $participant->update([
            'status' => 'submitted',
            'submissao_id' => $submissao->id,
            'submitted_at' => now(),
        ]);

        SubmissionJob::dispatch($submissao->id);

        return $submissao;
    }

    public function notifySidecar(int $jamSessionId, int $userId, string $status, array $testResults = []): void
    {
        $sidecarUrl = config('services.ws_server.url', 'http://ws_server:3001');

        try {
            Http::post("{$sidecarUrl}/jam/result", [
                'jamSessionId' => $jamSessionId,
                'userId' => $userId,
                'status' => $status,
                'testResults' => $testResults,
            ]);
        } catch (\Throwable $e) {
            Log::warning('Failed to notify jam sidecar', [
                'jam_session_id' => $jamSessionId,
                'user_id' => $userId,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
