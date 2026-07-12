import { useCallback, useEffect, useState } from 'react';
import { AuthApi, type CurrentUser } from '@/apis/auth';

const AUTH_EVENT = 'blog-auth-change';

export function useAuth() {
  const [user, setUser] = useState<CurrentUser | null | undefined>(undefined);

  const refresh = useCallback(async () => {
    try {
      setUser(await AuthApi.getCurrentUser());
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    void refresh();
    window.addEventListener(AUTH_EVENT, refresh);
    return () => window.removeEventListener(AUTH_EVENT, refresh);
  }, [refresh]);

  const logout = async () => {
    await AuthApi.logout();
    window.dispatchEvent(new Event(AUTH_EVENT));
  };

  return { user, login: AuthApi.login, logout, refresh };
}
