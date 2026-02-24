import { useState, useEffect, useRef, useCallback } from "react";
import { JamSessionService } from "@/services/JamSessionService";
import type { JamSession, JamParticipant, JamStreamParticipant } from "@/types/jam";

export interface JamSubmissionResult {
  userId: number;
  status: string;
  statusMessage?: string;
  testResults?: Array<{
    caso_teste_id: number;
    status: string;
    compile_output: string | null;
    stdout: string | null;
  }>;
}

interface UseJamSessionReturn {
  session: JamSession | null;
  participants: JamStreamParticipant[];
  myParticipant: JamParticipant | null;
  submissionResults: Record<number, JamSubmissionResult>;
  connected: boolean;
  error: string | null;
  updateCode: (code: string) => void;
  updateCursor: (line: number, column: number) => void;
  submitCode: () => void;
  startSession: () => void;
  endSession: () => void;
  giveFeedback: (studentId: number, feedback: string) => void;
  updateSettings: (settings: { titulo?: string; instrucoes?: string | null; tempoLimite?: number | null }) => void;
}

export function useJamSession(jamId: number | null): UseJamSessionReturn {
  const [session, setSession] = useState<JamSession | null>(null);
  const [participants, setParticipants] = useState<JamStreamParticipant[]>([]);
  const [myParticipant, setMyParticipant] = useState<JamParticipant | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submissionResults, setSubmissionResults] = useState<Record<number, JamSubmissionResult>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const codeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cursorDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldReconnectRef = useRef(true);
  const sessionStatusRef = useRef<string | null>(null);

  const connect = useCallback(() => {
    if (!jamId) return;

    const ws = JamSessionService.connectWebSocket(jamId);
    wsRef.current = ws;

    ws.onopen = () => {
      if (wsRef.current !== ws) return; // Stale WS, ignore
      setConnected(true);
      setError(null);
      // Authenticate
      ws.send(JSON.stringify({
        type: "AUTH",
        token: JamSessionService.getAuthToken(),
        jamId,
      }));
    };

    ws.onmessage = (event) => {
      if (wsRef.current !== ws) return; // Stale WS, ignore
      try {
        const msg = JSON.parse(event.data);

        switch (msg.type) {
          case "INIT":
            setSession(msg.session);
            setParticipants(msg.participants || []);
            setMyParticipant(msg.myParticipant);
            sessionStatusRef.current = msg.session?.status || null;
            break;

          case "STATE_UPDATE":
            setParticipants(msg.participants || []);
            if (msg.status) {
              sessionStatusRef.current = msg.status;
              setSession((prev) => {
                if (!prev) return prev;
                const updates: Partial<JamSession> = { status: msg.status, started_at: msg.startedAt };
                if (msg.titulo !== undefined) updates.titulo = msg.titulo;
                if (msg.instrucoes !== undefined) updates.instrucoes = msg.instrucoes;
                if (msg.tempoLimite !== undefined) updates.tempo_limite = msg.tempoLimite;
                return { ...prev, ...updates };
              });
            }
            break;

          case "CURSOR_UPDATE":
            setParticipants((prev) =>
              prev.map((p) =>
                p.userId === msg.userId ? { ...p, cursor: msg.cursor } : p
              )
            );
            break;

          case "SUBMISSION_RESULT":
            // Update the specific participant's status
            setParticipants((prev) =>
              prev.map((p) =>
                p.userId === msg.userId ? { ...p, status: msg.status } : p
              )
            );
            setSubmissionResults((prev) => ({
              ...prev,
              [msg.userId]: {
                userId: msg.userId,
                status: msg.status,
                statusMessage: msg.testResults?.statusMessage,
                testResults: msg.testResults?.testResults,
              },
            }));
            break;

          case "ERROR":
            setError(msg.message);
            break;
        }
      } catch {
        // Ignore parse errors
      }
    };

    ws.onclose = () => {
      if (wsRef.current !== ws) return; // Stale WS, ignore
      setConnected(false);
      // Only reconnect if session is not finished and component is still mounted
      if (shouldReconnectRef.current && sessionStatusRef.current !== "finished") {
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      }
    };

    ws.onerror = () => {
      if (wsRef.current !== ws) return; // Stale WS, ignore
      setError("Erro de conexão WebSocket");
    };
  }, [jamId]);

  useEffect(() => {
    shouldReconnectRef.current = true;
    connect();

    return () => {
      shouldReconnectRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (codeDebounceRef.current) {
        clearTimeout(codeDebounceRef.current);
      }
      if (cursorDebounceRef.current) {
        clearTimeout(cursorDebounceRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const updateCode = useCallback((code: string) => {
    // Debounce code updates - send at most every 500ms
    if (codeDebounceRef.current) {
      clearTimeout(codeDebounceRef.current);
    }
    codeDebounceRef.current = setTimeout(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "UPDATE_CODE", code }));
      }
    }, 500);
  }, []);

  const updateCursor = useCallback((line: number, column: number) => {
    if (cursorDebounceRef.current) {
      clearTimeout(cursorDebounceRef.current);
    }
    cursorDebounceRef.current = setTimeout(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "UPDATE_CURSOR", line, column }));
      }
    }, 100);
  }, []);

  const submitCode = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "SUBMIT_CODE" }));
    }
  }, []);

  const startSession = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "START_SESSION" }));
    }
  }, []);

  const endSession = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "END_SESSION" }));
    }
  }, []);

  const giveFeedback = useCallback((studentId: number, feedback: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "GIVE_FEEDBACK", studentId, feedback }));
    }
  }, []);

  const updateSettings = useCallback((settings: { titulo?: string; instrucoes?: string | null; tempoLimite?: number | null }) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "UPDATE_SETTINGS", ...settings }));
    }
  }, []);

  return {
    session,
    participants,
    myParticipant,
    submissionResults,
    connected,
    error,
    updateCode,
    updateCursor,
    submitCode,
    startSession,
    endSession,
    giveFeedback,
    updateSettings,
  };
}
