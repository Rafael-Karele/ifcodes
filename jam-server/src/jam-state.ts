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
  participants: Map<number, ParticipantState>;
}

const sessions = new Map<number, SessionState>();

export function getOrCreateSession(jamId: number): SessionState {
  if (!sessions.has(jamId)) {
    sessions.set(jamId, {
      jamId,
      status: 'waiting',
      startedAt: null,
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

export function serializeSession(session: SessionState) {
  return {
    jamId: session.jamId,
    status: session.status,
    startedAt: session.startedAt,
    participants: Array.from(session.participants.values()),
  };
}

export function removeSession(jamId: number): void {
  sessions.delete(jamId);
}
