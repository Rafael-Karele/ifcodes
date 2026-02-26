import axios, { AxiosInstance } from 'axios';

const LARAVEL_API_URL = process.env.LARAVEL_API_URL || 'http://laravel_app:8000';

const client: AxiosInstance = axios.create({
  baseURL: LARAVEL_API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

export default client;

export async function getUserTurmaIds(token: string): Promise<number[]> {
  try {
    const res = await client.get('/api/turmas', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const turmas = res.data?.data ?? res.data;
    if (Array.isArray(turmas)) {
      return turmas.map((t: any) => t.id);
    }
    return [];
  } catch (e: any) {
    console.error('Failed to get user turmas:', e.message);
    return [];
  }
}
