import WebSocket from 'ws';
import {
  validateToken,
  updateCode,
  submitCode,
  startSession,
  endSession,
  giveFeedback,
  getSessionData,
  updateSessionSettings as restUpdateSettings,
  LaravelUser,
} from './laravel-client';
import {
  getOrCreateSession,
  setParticipant,
  setParticipantOnline,
  updateParticipantCode,
  updateParticipantCursor,
  updateParticipantStatus,
  updateParticipantFeedback,
  updateSessionStatus,
  updateSessionSettings,
  serializeSession,
  getSession,
} from './jam-state';

interface AuthenticatedClient {
  ws: WebSocket;
  user: LaravelUser;
  jamId: number;
  token: string;
  isProfessor: boolean;
}

const clients = new Map<WebSocket, AuthenticatedClient>();
const jamClients = new Map<number, Set<WebSocket>>();

// Auto-end timers: when all professors disconnect, schedule session end after 30 min
const PROFESSOR_DISCONNECT_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const professorDisconnectTimers = new Map<number, NodeJS.Timeout>();
// Store a valid professor token per session so we can call endSession even after disconnect
const professorTokens = new Map<number, string>();

function hasProfessorOnline(jamId: number): boolean {
  const sockets = jamClients.get(jamId);
  if (!sockets) return false;
  for (const ws of sockets) {
    const client = clients.get(ws);
    if (client && client.isProfessor && ws.readyState === WebSocket.OPEN) {
      return true;
    }
  }
  return false;
}

function clearProfessorTimer(jamId: number): void {
  const timer = professorDisconnectTimers.get(jamId);
  if (timer) {
    clearTimeout(timer);
    professorDisconnectTimers.delete(jamId);
    console.log(`[jam ${jamId}] Professor reconnected — auto-end timer cancelled`);
  }
}

function startProfessorDisconnectTimer(jamId: number): void {
  // Don't start if there's already a timer or if a professor is still online
  if (professorDisconnectTimers.has(jamId) || hasProfessorOnline(jamId)) return;

  const session = getSession(jamId);
  if (!session || session.status === 'finished') return;

  console.log(`[jam ${jamId}] All professors disconnected — session will auto-end in 30 minutes`);

  const timer = setTimeout(async () => {
    professorDisconnectTimers.delete(jamId);

    // Re-check: maybe a professor came back (timer shouldn't exist, but be safe)
    if (hasProfessorOnline(jamId)) return;

    const currentSession = getSession(jamId);
    if (!currentSession || currentSession.status === 'finished') return;

    const token = professorTokens.get(jamId);
    if (token) {
      const result = await endSession(jamId, token);
      if (!result) {
        console.error(`[jam ${jamId}] Failed to auto-end session via Laravel`);
      }
    } else {
      console.error(`[jam ${jamId}] No professor token available to auto-end session`);
    }

    updateSessionStatus(jamId, 'finished');
    broadcastToJam(jamId, 'SESSION_AUTO_ENDED', {
      reason: 'Professor desconectado por mais de 30 minutos',
    });
    broadcastToJam(jamId, 'STATE_UPDATE', serializeSession(currentSession));
    console.log(`[jam ${jamId}] Session auto-ended due to professor inactivity`);
  }, PROFESSOR_DISCONNECT_TIMEOUT_MS);

  professorDisconnectTimers.set(jamId, timer);
}

function send(ws: WebSocket, type: string, payload: any) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type, ...payload }));
  }
}

function broadcastToJam(jamId: number, type: string, payload: any) {
  const sockets = jamClients.get(jamId);
  if (!sockets) return;
  const message = JSON.stringify({ type, ...payload });
  for (const ws of sockets) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  }
}

export function broadcastResult(jamId: number, userId: number, status: string, testResults: any[]) {
  updateParticipantStatus(jamId, userId, status);
  const session = getSession(jamId);
  if (session) {
    broadcastToJam(jamId, 'SUBMISSION_RESULT', {
      userId,
      status,
      testResults,
    });
    broadcastToJam(jamId, 'STATE_UPDATE', serializeSession(session));
  }
}

export async function handleConnection(ws: WebSocket) {
  let authenticated = false;

  ws.on('message', async (raw: Buffer) => {
    let msg: any;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      send(ws, 'ERROR', { message: 'Invalid JSON' });
      return;
    }

    if (!authenticated && msg.type !== 'AUTH') {
      send(ws, 'ERROR', { message: 'Not authenticated. Send AUTH first.' });
      return;
    }

    try {
    switch (msg.type) {
      case 'AUTH': {
        const { token, jamId } = msg;
        if (!token || !jamId) {
          send(ws, 'ERROR', { message: 'Missing token or jamId' });
          return;
        }

        const user = await validateToken(token);
        if (!user) {
          send(ws, 'ERROR', { message: 'Invalid token' });
          ws.close();
          return;
        }

        // Fetch session data from Laravel
        const sessionData = await getSessionData(jamId, token);
        if (!sessionData) {
          send(ws, 'ERROR', { message: 'Session not found' });
          ws.close();
          return;
        }

        const isProfessor = user.roles.includes('professor') || user.roles.includes('admin');

        const client: AuthenticatedClient = { ws, user, jamId, token, isProfessor };
        clients.set(ws, client);

        if (!jamClients.has(jamId)) {
          jamClients.set(jamId, new Set());
        }
        jamClients.get(jamId)!.add(ws);

        // Initialize in-memory state from Laravel data
        const session = getOrCreateSession(jamId);
        session.status = sessionData.status;
        session.startedAt = sessionData.started_at;
        session.titulo = sessionData.titulo || '';
        session.instrucoes = sessionData.instrucoes || null;
        session.tempoLimite = sessionData.tempo_limite ?? null;

        if (sessionData.participants) {
          for (const p of sessionData.participants) {
            // Preserve online status if participant already exists in memory
            const existing = session.participants.get(p.user_id);
            setParticipant(jamId, p.user_id, {
              userId: p.user_id,
              userName: p.user?.name || 'Unknown',
              code: p.codigo || '',
              language: p.linguagem || 'c',
              status: p.status,
              feedback: Array.isArray(p.feedback) ? p.feedback : [],
              online: existing ? existing.online : false,
            });
          }
        }

        // Mark this user as online
        setParticipantOnline(jamId, user.id, true);

        // Professor-specific: store token for auto-end and cancel disconnect timer
        if (isProfessor) {
          professorTokens.set(jamId, token);
          clearProfessorTimer(jamId);
        }

        // Find this user's participant data
        const myParticipant = sessionData.participants?.find((p: any) => p.user_id === user.id);

        authenticated = true;
        send(ws, 'INIT', {
          session: {
            ...sessionData,
            participants: undefined,
          },
          participants: Array.from(session.participants.values()),
          myParticipant: myParticipant || null,
        });

        // Broadcast updated participants to everyone (so professor sees new students)
        broadcastToJam(jamId, 'STATE_UPDATE', serializeSession(session));
        break;
      }

      case 'UPDATE_CODE': {
        const client = clients.get(ws)!;
        const { code } = msg;
        if (typeof code !== 'string') return;

        updateParticipantCode(client.jamId, client.user.id, code);

        // Persist to Laravel (fire and forget)
        updateCode(client.jamId, client.token, code);

        // Broadcast updated state
        const session = getSession(client.jamId);
        if (session) {
          broadcastToJam(client.jamId, 'STATE_UPDATE', serializeSession(session));
        }
        break;
      }

      case 'SUBMIT_CODE': {
        const client = clients.get(ws)!;
        updateParticipantStatus(client.jamId, client.user.id, 'submitted');

        const result = await submitCode(client.jamId, client.token);
        if (!result) {
          send(ws, 'ERROR', { message: 'Failed to submit code' });
          return;
        }

        const session = getSession(client.jamId);
        if (session) {
          broadcastToJam(client.jamId, 'STATE_UPDATE', serializeSession(session));
        }
        break;
      }

      case 'START_SESSION': {
        const client = clients.get(ws)!;
        if (!client.isProfessor) {
          send(ws, 'ERROR', { message: 'Only professors can start sessions' });
          return;
        }

        const result = await startSession(client.jamId, client.token);
        if (!result) {
          send(ws, 'ERROR', { message: 'Failed to start session' });
          return;
        }

        updateSessionStatus(client.jamId, 'active', result.started_at);
        const session = getSession(client.jamId);
        if (session) {
          broadcastToJam(client.jamId, 'STATE_UPDATE', serializeSession(session));
        }
        break;
      }

      case 'END_SESSION': {
        const client = clients.get(ws)!;
        if (!client.isProfessor) {
          send(ws, 'ERROR', { message: 'Only professors can end sessions' });
          return;
        }

        const result = await endSession(client.jamId, client.token);
        if (!result) {
          send(ws, 'ERROR', { message: 'Failed to end session' });
          return;
        }

        updateSessionStatus(client.jamId, 'finished');
        const session = getSession(client.jamId);
        if (session) {
          broadcastToJam(client.jamId, 'STATE_UPDATE', serializeSession(session));
        }
        break;
      }

      case 'GIVE_FEEDBACK': {
        const client = clients.get(ws)!;
        if (!client.isProfessor) {
          send(ws, 'ERROR', { message: 'Only professors can give feedback' });
          return;
        }

        const { studentId, feedback } = msg;
        if (!studentId || !feedback) return;

        const fbResult = await giveFeedback(client.jamId, studentId, feedback, client.token);
        if (!fbResult) {
          send(ws, 'ERROR', { message: 'Failed to give feedback' });
          return;
        }

        updateParticipantFeedback(client.jamId, studentId, feedback);
        const session = getSession(client.jamId);
        if (session) {
          broadcastToJam(client.jamId, 'STATE_UPDATE', serializeSession(session));
        }
        break;
      }

      case 'UPDATE_SETTINGS': {
        const client = clients.get(ws)!;
        if (!client.isProfessor) {
          send(ws, 'ERROR', { message: 'Only professors can update settings' });
          return;
        }

        const { titulo, instrucoes, tempoLimite } = msg;
        const restPayload: any = {};
        if (titulo !== undefined) restPayload.titulo = titulo;
        if (instrucoes !== undefined) restPayload.instrucoes = instrucoes;
        if (tempoLimite !== undefined) restPayload.tempo_limite = tempoLimite;

        const result = await restUpdateSettings(client.jamId, restPayload, client.token);
        if (!result) {
          send(ws, 'ERROR', { message: 'Failed to update settings' });
          return;
        }

        updateSessionSettings(client.jamId, { titulo, instrucoes, tempoLimite });
        const session = getSession(client.jamId);
        if (session) {
          broadcastToJam(client.jamId, 'STATE_UPDATE', serializeSession(session));
        }
        break;
      }

      case 'UPDATE_CURSOR': {
        const client = clients.get(ws)!;
        const { line, column } = msg;
        if (typeof line !== 'number' || typeof column !== 'number') return;

        updateParticipantCursor(client.jamId, client.user.id, { line, column });

        // Lightweight broadcast — no STATE_UPDATE
        broadcastToJam(client.jamId, 'CURSOR_UPDATE', {
          userId: client.user.id,
          cursor: { line, column },
        });
        break;
      }

      default:
        send(ws, 'ERROR', { message: `Unknown message type: ${msg.type}` });
    }
    } catch (err: any) {
      console.error('Error handling WS message:', err.message);
      send(ws, 'ERROR', { message: 'Internal server error' });
    }
  });

  ws.on('close', () => {
    const client = clients.get(ws);
    if (client) {
      const { jamId } = client;
      const sockets = jamClients.get(jamId);
      if (sockets) {
        sockets.delete(ws);
        if (sockets.size === 0) {
          jamClients.delete(jamId);
        }
      }
      clients.delete(ws);

      // Mark participant as offline and broadcast
      setParticipantOnline(jamId, client.user.id, false);
      const session = getSession(jamId);
      if (session) {
        broadcastToJam(jamId, 'STATE_UPDATE', serializeSession(session));
      }

      // If a professor disconnected, start auto-end timer
      if (client.isProfessor) {
        startProfessorDisconnectTimer(jamId);
      }
    }
  });
}
