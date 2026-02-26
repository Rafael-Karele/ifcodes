import client from '../../shared/laravel-client';

export async function updateCode(jamId: number, token: string, code: string, language?: string): Promise<void> {
  try {
    await client.put(`/api/jam-sessions/${jamId}/code`, {
      codigo: code,
      linguagem: language,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (e: any) {
    console.error('Failed to persist code to Laravel:', e.message);
  }
}

export async function submitCode(jamId: number, token: string): Promise<any> {
  try {
    const res = await client.post(`/api/jam-sessions/${jamId}/submit`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (e: any) {
    console.error('Failed to submit code via Laravel:', e.message);
    return null;
  }
}

export async function startSession(jamId: number, token: string): Promise<any> {
  try {
    const res = await client.post(`/api/jam-sessions/${jamId}/start`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (e: any) {
    console.error('Failed to start session:', e.message);
    return null;
  }
}

export async function endSession(jamId: number, token: string): Promise<any> {
  try {
    const res = await client.post(`/api/jam-sessions/${jamId}/finish`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (e: any) {
    console.error('Failed to end session:', e.message);
    return null;
  }
}

export async function giveFeedback(jamId: number, studentId: number, feedback: string, token: string): Promise<any> {
  try {
    const res = await client.put(`/api/jam-sessions/${jamId}/feedback/${studentId}`, { feedback }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (e: any) {
    console.error('Failed to give feedback:', e.message);
    return null;
  }
}

export async function updateSessionSettings(
  jamId: number,
  updates: { titulo?: string; instrucoes?: string | null; tempo_limite?: number | null },
  token: string,
): Promise<any> {
  try {
    const res = await client.put(`/api/jam-sessions/${jamId}`, updates, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (e: any) {
    console.error('Failed to update session settings:', e.message);
    return null;
  }
}

export async function getSessionData(jamId: number, token: string): Promise<any> {
  try {
    const res = await client.get(`/api/jam-sessions/${jamId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (e: any) {
    console.error('Failed to get session data:', e.message);
    return null;
  }
}
