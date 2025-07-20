import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services';
import { initDataRaw } from '@telegram-apps/sdk-react';

interface UseAuthProps {
  onAuth?(): void | Promise<void>;
  redirectToAuth?: boolean;
}

export const useAuth = (props?: UseAuthProps) => {
  const [authorized, setAuthorized] = useState(false);
  const [requested, setRequested] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await authService.checkAuthorized();
        setAuthorized(true);
        setRequested(true);
        setLoading(false);
        props?.onAuth?.();
      } catch {
        // Проверяем, есть ли данные от Telegram Web App
        const initData = initDataRaw();

        if (initData) {
          try {
            await authService.authTelegramWebApp({ data: initData });
            setAuthorized(true);
            setRequested(true);
            setLoading(false);
            props?.onAuth?.();
            return;
          } catch (webAppError) {
            console.error('Web App auth error:', webAppError);
          }
        }

        setAuthorized(false);
        setRequested(true);
        setLoading(false);

        if (props?.redirectToAuth !== false) {
          router.replace(`/auth?to=${encodeURIComponent(pathname)}`);
        }
      }
    };

    checkAuth();
  }, [router, pathname, props]);

  return {
    authorized,
    requested,
    loading
  };
};
