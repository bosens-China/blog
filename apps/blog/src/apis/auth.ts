import { API_BASE, apiFetch } from './client';

export interface CurrentUser {
  id: number;
  login: string;
  avatar_url: string | null;
  profile_url: string | null;
  is_author: boolean;
}

export const AuthApi = {
  getCurrentUser: async (): Promise<CurrentUser | null> => {
    const response = await apiFetch('/api/auth/me');
    if (response.status === 401) return null;
    if (!response.ok) throw new Error('获取登录状态失败');
    return (await response.json()) as CurrentUser;
  },

  login: () => {
    const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    window.location.assign(
      `${API_BASE}/api/auth/github/login?return_to=${encodeURIComponent(returnTo)}`,
    );
  },

  logout: async () => {
    const response = await apiFetch('/api/auth/logout', { method: 'POST' });
    if (!response.ok) throw new Error('退出登录失败');
  },
};
