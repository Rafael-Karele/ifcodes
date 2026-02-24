export interface FeedbackEntry {
  message: string;
  created_at: string;
}

export interface ParticipantState {
  userId: number;
  userName: string;
  code: string;
  language: string;
  status: string;
  feedback: FeedbackEntry[];
  online: boolean;
}

export interface SessionState {
  jamId: number;
  status: string;
  startedAt: string | null;
  titulo: string;
  instrucoes: string | null;
  tempoLimite: number | null;
  participants: Map<number, ParticipantState>;
}

const sessions = new Map<number, SessionState>();

export function getOrCreateSession(jamId: number): SessionState {
  if (!sessions.has(jamId)) {
    sessions.set(jamId, {
      jamId,
      status: 'waiting',
      startedAt: null,
      titulo: '',
      instrucoes: null,
      tempoLimite: null,
      participants: new Map(),
    });
  }
  return sessions.get(jamId)!;
}

export function getSession(jamId: number): SessionState | undefined {
  return sessions.get(jamId);
}

export function setParticipant(jamId: number, userId: number, data: ParticipantState): void {
  const session = getOrCreateSession(jamId);
  session.participants.set(userId, data);
}

export function setParticipantOnline(jamId: number, userId: number, online: boolean): void {
  const session = sessions.get(jamId);
  if (!session) return;
  const p = session.participants.get(userId);
  if (p) p.online = online;
}

export function updateParticipantCode(jamId: number, userId: number, code: string): boolean {
  const session = sessions.get(jamId);
  if (!session) return false;
  const p = session.participants.get(userId);
  if (!p) return false;
  p.code = code;
  if (p.status === 'joined') p.status = 'coding';
  return true;
}

export function updateParticipantStatus(jamId: number, userId: number, status: string): boolean {
  const session = sessions.get(jamId);
  if (!session) return false;
  const p = session.participants.get(userId);
  if (!p) return false;
  p.status = status;
  return true;
}

export function updateParticipantFeedback(jamId: number, userId: number, feedback: string): FeedbackEntry[] {
  const session = sessions.get(jamId);
  if (!session) return [];
  const p = session.participants.get(userId);
  if (!p) return [];
  const entry: FeedbackEntry = { message: feedback, created_at: new Date().toISOString() };
  p.feedback = [...p.feedback, entry];
  return p.feedback;
}

export function updateSessionStatus(jamId: number, status: string, startedAt?: string): void {
  const session = getOrCreateSession(jamId);
  session.status = status;
  if (startedAt) session.startedAt = startedAt;
}

export function updateSessionSettings(
  jamId: number,
  updates: { titulo?: string; instrucoes?: string | null; tempoLimite?: number | null },
): void {
  const session = getOrCreateSession(jamId);
  if (updates.titulo !== undefined) session.titulo = updates.titulo;
  if (updates.instrucoes !== undefined) session.instrucoes = updates.instrucoes;
  if (updates.tempoLimite !== undefined) session.tempoLimite = updates.tempoLimite;
}

export function serializeSession(session: SessionState) {
  return {
    jamId: session.jamId,
    status: session.status,
    startedAt: session.startedAt,
    titulo: session.titulo,
    instrucoes: session.instrucoes,
    tempoLimite: session.tempoLimite,
    participants: Array.from(session.participants.values()),
  };
}

export function removeSession(jamId: number): void {
  sessions.delete(jamId);
}
