<?php

namespace App\Support;

use Predis\Client as PredisClient;

class SseNotifier
{
    private static function redis(): PredisClient
    {
        return new PredisClient([
            'host' => config('database.redis.default.host', '127.0.0.1'),
            'port' => config('database.redis.default.port', 6379),
            'password' => config('database.redis.default.password'),
        ]);
    }

    public static function toUser(int $userId, string $event): void
    {
        self::redis()->publish("sse:user.{$userId}", json_encode(['event' => $event]));
    }

    public static function toTurma(int $turmaId, string $event): void
    {
        self::redis()->publish("sse:turma.{$turmaId}", json_encode(['event' => $event]));
    }
}
