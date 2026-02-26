<?php

namespace App\Support;

use Illuminate\Support\Facades\Redis;

class SseNotifier
{
    public static function toUser(int $userId, string $event): void
    {
        // Use raw client to bypass Laravel's key prefix on pub/sub channels
        Redis::connection()->client()->publish("sse:user.{$userId}", json_encode(['event' => $event]));
    }

    public static function toTurma(int $turmaId, string $event): void
    {
        Redis::connection()->client()->publish("sse:turma.{$turmaId}", json_encode(['event' => $event]));
    }
}
