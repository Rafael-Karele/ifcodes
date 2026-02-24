export type JamSessionStatus = 'waiting' | 'active' | 'finished';
export type JamParticipantStatus = 'joined' | 'coding' | 'submitted' | 'passed' | 'failed' | 'error';

export interface JamSession {
  id: number;
  turma_id: number;
  problema_id: number;
  professor_id: number;
  titulo: string;
  instrucoes: string | null;
  tempo_limite: number | null;
  status: JamSessionStatus;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
  updated_at: string;
  problema?: {
    id: number;
    titulo: string;
    enunciado: string;
    tempo_limite: number;
    memoria_limite: number;
    casos_teste?: Array<{
      id: number;
      entrada: string;
      saida: string;
    }>;
  };
  professor?: {
    id: number;
    name: string;
    email: string;
  };
  participants?: JamParticipant[];
}

export interface FeedbackEntry {
  message: string;
  created_at: string;
}

export interface JamParticipant {
  id: number;
  jam_session_id: number;
  user_id: number;
  codigo: string | null;
  linguagem: string;
  status: JamParticipantStatus;
  submissao_id: number | null;
  feedback: FeedbackEntry[];
  joined_at: string | null;
  submitted_at: string | null;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface JamStreamParticipant {
  userId: number;
  userName: string;
  code: string;
  language: string;
  status: string;
  feedback: FeedbackEntry[];
  online: boolean;
}

export interface JamStreamData {
  jamId: number;
  status: string;
  startedAt: string | null;
  participants: JamStreamParticipant[];
}

export interface CreateJamSessionDTO {
  turma_id: number;
  problema_id: number;
  titulo: string;
  instrucoes?: string;
  tempo_limite?: number;
}
