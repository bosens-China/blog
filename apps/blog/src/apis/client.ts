export const API_BASE =
  import.meta.env.PUBLIC_ASK_AI_API || 'http://localhost:8000';

export async function apiFetch(path: string, init: RequestInit = {}) {
  return fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  });
}

export async function apiJson<T>(path: string, init: RequestInit = {}) {
  const response = await apiFetch(path, init);
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    const detail = data?.detail;
    throw new Error(
      typeof detail === 'string'
        ? detail
        : detail?.message || '请求失败，请稍后重试',
    );
  }
  return (await response.json()) as T;
}
