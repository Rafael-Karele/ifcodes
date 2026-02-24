<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JamSession extends Model
{
    protected $table = 'jam_sessions';

    protected $fillable = [
        'turma_id',
        'problema_id',
        'professor_id',
        'titulo',
        'instrucoes',
        'tempo_limite',
        'status',
        'started_at',
        'finished_at',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
    ];

    public function turma(): BelongsTo
    {
        return $this->belongsTo(Turma::class);
    }

    public function problema(): BelongsTo
    {
        return $this->belongsTo(Problema::class);
    }

    public function professor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'professor_id');
    }

    public function participants(): HasMany
    {
        return $this->hasMany(JamParticipant::class);
    }
}
