<?php

namespace App\Jobs;

use App\Facades\Judge0;
use App\Models\Correcao;
use App\Models\Submissao;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use App\Lib\Dicionarios\Status;
use App\Models\JamParticipant;
use App\Services\JamSubmissaoService;
use Throwable;

class CheckSubmissionStatusJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    private const PENDING_STATUSES = [1, 2];
    private const POLLING_DELAY_SECONDS = 1;
    private const POLLING_DELAY_SLOW_SECONDS = 2;
    private const SLOW_THRESHOLD = 15;
    private const MAX_ATTEMPTS = 25;

    private int $submissaoId;
    private int $remainingAttempts;

    public function __construct(int $submissaoId, int $remainingAttempts = self::MAX_ATTEMPTS)
    {
        $this->submissaoId = $submissaoId;
        $this->remainingAttempts = $remainingAttempts;
    }

    public function handle(): void
    {
        $submissao = Submissao::with('correcoes')->find($this->submissaoId);

        if (is_null($submissao)) {
            Log::warning('Submissão não encontrada ao verificar status.', [
                'submissao_id' => $this->submissaoId,
            ]);

            return;
        }

        try {
            $resultados = Judge0::getResultados($submissao);
        } catch (Throwable $exception) {
            Log::error('Erro ao consultar resultados no Judge0.', [
                'submissao_id' => $this->submissaoId,
                'exception' => $exception->getMessage(),
            ]);

            throw $exception;
        }

        $possuiPendentes = false;
        $testResults = [];

        foreach ($resultados as $resultado) {
            if (is_null($resultado) || !isset($resultado['token'])) {
                continue;
            }

            $correcao = $submissao->correcoes->firstWhere('token', $resultado['token']);

            if (is_null($correcao)) {
                Log::warning('Correção não encontrada por token retornado pelo Judge0.', [
                    'submissao_id' => $this->submissaoId,
                    'token' => $resultado['token'],
                ]);

                continue;
            }

            $statusId = $resultado['status_id'];
            $compileOutput = isset($resultado['compile_output'])
                ? base64_decode($resultado['compile_output'])
                : null;
            $stdout = isset($resultado['stdout'])
                ? base64_decode($resultado['stdout'])
                : null;

            if (in_array($statusId, self::PENDING_STATUSES, true)) {
                $possuiPendentes = true;
                continue;
            } elseif ($statusId != STATUS::ACEITA) {
                $submissao->status_correcao_id = $statusId;
                $submissao->save();

                $statusInfo = Status::get($statusId);
                $testResults[] = [
                    'caso_teste_id' => $correcao->caso_teste_id,
                    'status' => $statusInfo['nome'] ?? 'Erro',
                    'compile_output' => $compileOutput,
                    'stdout' => $stdout,
                ];

                $this->notifyJamSidecarIfNeeded($submissao, 'failed', $statusInfo['nome'] ?? 'Erro', $testResults);
                return;
            }

            $correcao->status_correcao_id = $statusId;
            $correcao->save();

            $testResults[] = [
                'caso_teste_id' => $correcao->caso_teste_id,
                'status' => 'Aceita',
                'compile_output' => null,
                'stdout' => $stdout,
            ];
        }

        if ($possuiPendentes) {
            if ($this->remainingAttempts <= 0) {
                Log::warning('Limite de tentativas atingido ao verificar status da submissão.', [
                    'submissao_id' => $this->submissaoId,
                ]);

                $submissao->status_correcao_id = STATUS::TEMPO_LIMITE_EXCEDIDO;
                $submissao->save();
                $this->notifyJamSidecarIfNeeded($submissao, 'error', 'Tempo Limite Excedido', $testResults);
                return;
            }

            $delay = $this->remainingAttempts <= self::SLOW_THRESHOLD
                ? self::POLLING_DELAY_SLOW_SECONDS
                : self::POLLING_DELAY_SECONDS;

            CheckSubmissionStatusJob::dispatch($this->submissaoId, $this->remainingAttempts - 1)
                ->delay(now()->addSeconds($delay));
        } else {
            $submissao->status_correcao_id = Status::ACEITA;
            $submissao->save();
            $this->notifyJamSidecarIfNeeded($submissao, 'passed', 'Aceita', $testResults);
            return;
        }
    }

    private function notifyJamSidecarIfNeeded(Submissao $submissao, string $jamStatus, string $statusMessage, array $testResults = []): void
    {
        $jamParticipant = JamParticipant::where('submissao_id', $submissao->id)->first();

        if (!$jamParticipant) {
            return;
        }

        $jamParticipant->update(['status' => $jamStatus]);

        (new JamSubmissaoService())->notifySidecar(
            $jamParticipant->jam_session_id,
            $jamParticipant->user_id,
            $jamStatus,
            [
                'statusMessage' => $statusMessage,
                'testResults' => $testResults,
            ],
        );
    }
}
