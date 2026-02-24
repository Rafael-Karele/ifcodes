<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JamParticipant extends Model
{
    protected $table = 'jam_participants';

    protected $fillable = [
        'jam_session_id',
        'user_id',
        'codigo',
        'linguagem',
        'status',
        'submissao_id',
        'feedback',
        'joined_at',
        'submitted_at',
    ];

    protected $casts = [
        'joined_at' => 'datetime',
        'submitted_at' => 'datetime',
        'feedback' => 'array',
    ];

    public function jamSession(): BelongsTo
    {
        return $this->belongsTo(JamSession::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function submissao(): BelongsTo
    {
        return $this->belongsTo(Submissao::class);
    }
}
