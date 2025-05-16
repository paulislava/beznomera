import { authService } from '@/services';
import { useEffect, useState } from 'react';
import { initData } from '@telegram-apps/sdk-react';
import { useRouter } from 'next/router';
import { usePathname } from 'next/navigation';

interface UseNeedAuthProps {
  onAuth?(): void | Promise<void>;
}

const useNeedAuth = (props?: UseNeedAuthProps) => {
  const [authorized, setAuthorized] = useState(false);
  const [requested, setRequested] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const successAuth = () => {
      setRequested(true);

      setAuthorized(true);
      props?.onAuth?.();
    };

    const errorAuth = () => {
      setRequested(true);
      setAuthorized(false);
      const params = new URLSearchParams();
      params.set('to', pathname);

      router.replace(`/login?${params.toString()}`);
    };

    authService
      .checkAuthorized()
      .then(successAuth)
      .catch(() => {
        const initDataRaw = initData.raw();

        if (initDataRaw) {
          authService.authTelegramWebApp({ data: initDataRaw }).then(successAuth).catch(errorAuth);
        } else {
          errorAuth();
        }
      });
  }, [pathname, props, router]);

  useEffect(() => {
    if (!authorized && requested) {
      const params = new URLSearchParams();
      params.set('to', pathname);

      router.replace(`/login?${params.toString()}`);
    }
  }, [authorized, pathname, requested, router]);

  return authorized;
};

export default useNeedAuth;
