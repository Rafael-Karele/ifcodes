<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Laravel\Sanctum\PersonalAccessToken;
use App\Models\Aluno;
use App\Models\Professor;
use Predis\Client as PredisClient;

class SseController extends Controller
{
    private const KEEPALIVE_INTERVAL = 30;

    public function stream(Request $request): StreamedResponse
    {
        $token = $request->query('token');

        if (!$token) {
            abort(401, 'Token required');
        }

        $accessToken = PersonalAccessToken::findToken($token);

        if (!$accessToken) {
            abort(401, 'Invalid token');
        }

        $user = $accessToken->tokenable;

        $userId = $user->id;
        $channels = ["sse:user.{$userId}"];

        $aluno = Aluno::find($userId);
        if ($aluno) {
            foreach ($aluno->turmas()->pluck('turma.id') as $turmaId) {
                $channels[] = "sse:turma.{$turmaId}";
            }
        }

        $professor = Professor::find($userId);
        if ($professor) {
            foreach ($professor->turmas()->pluck('turma.id') as $turmaId) {
                $channels[] = "sse:turma.{$turmaId}";
            }
        }

        $channels = array_unique($channels);

        return new StreamedResponse(function () use ($channels) {
            // Disable output buffering
            if (function_exists('apache_setenv')) {
                apache_setenv('no-gzip', '1');
            }
            while (ob_get_level() > 0) {
                ob_end_flush();
            }

            // Create a dedicated predis client with read timeout for keepalive
            $redis = new PredisClient([
                'host' => config('database.redis.default.host', '127.0.0.1'),
                'port' => config('database.redis.default.port', 6379),
                'password' => config('database.redis.default.password'),
                'read_write_timeout' => self::KEEPALIVE_INTERVAL,
            ]);

            $pubsub = $redis->pubSubLoop();
            $pubsub->subscribe(...array_values($channels));

            $lastActivity = time();

            foreach ($pubsub as $message) {
                if (connection_aborted()) {
                    $pubsub->stop();
                    break;
                }

                if ($message->kind === 'message') {
                    $data = json_decode($message->payload, true);

                    if ($data && isset($data['event'])) {
                        echo "event: {$data['event']}\n";
                        echo "data: {}\n\n";
                    }

                    $lastActivity = time();
                }

                // Send keepalive if no activity for a while
                if ((time() - $lastActivity) >= self::KEEPALIVE_INTERVAL) {
                    echo ": keepalive\n\n";
                    $lastActivity = time();
                }

                if (ob_get_level() > 0) {
                    ob_flush();
                }
                flush();
            }
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no',
        ]);
    }
}
