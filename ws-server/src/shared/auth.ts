import client from './laravel-client';
import { LaravelUser } from './types';

export async function validateToken(token: string): Promise<LaravelUser | null> {
  try {
    const authHeaders = { Authorization: `Bearer ${token}` };
    const [userRes, rolesRes] = await Promise.all([
      client.get('/api/user', { headers: authHeaders }),
      client.get('/api/user/roles', { headers: authHeaders }),
    ]);
    return {
      ...userRes.data,
      roles: rolesRes.data?.roles || [],
    } as LaravelUser;
  } catch {
    return null;
  }
}
