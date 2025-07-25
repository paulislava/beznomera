import { useState, useEffect } from 'react';
import { RequestUser } from '../../../shared/src/user/user.types';

interface UseUserResult {
  user: RequestUser | null;
  loading: boolean;
  error: string | null;
}

/**
 * Хук для получения информации о текущем пользователе
 */
export function useUser(): UseUserResult {
  const [user, setUser] = useState<RequestUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch('/api/auth/user');

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setError('Unauthorized');
        }
      } catch {
        setError('Failed to fetch user');
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  return { user, loading, error };
}
