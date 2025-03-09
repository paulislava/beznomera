import { authService } from '@/services';
import { getWebApp } from '@/utils/telegram';
import { useFocusEffect, usePathname, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

interface UseNeedAuthProps {
  onAuth?(): void | Promise<void>;
}

const useNeedAuth = (props?: UseNeedAuthProps) => {
  const [authorized, setAuthorized] = useState(false);
  const [requested, setRequested] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useFocusEffect(() => {
    const successAuth = () => {
      setRequested(true);

      setAuthorized(true);
      props?.onAuth?.();
    };

    const errorAuth = () => {
      setRequested(true);
      setAuthorized(false);
      router.replace(`/login`);
      router.setParams({ to: pathname });
    };

    authService
      .checkAuthorized()
      .then(successAuth)
      .catch(() => {
        const webApp = getWebApp();

        if (webApp?.initData) {
          authService
            .authTelegramWebApp({ data: webApp.initData })
            .then(successAuth)
            .catch(errorAuth);
        } else {
          errorAuth();
        }
      });
  });

  useEffect(() => {
    if (!authorized && requested) {
      router.replace(`/login`);
      router.setParams({ to: pathname });
    }
  }, [authorized, requested]);

  return authorized;
};

export default useNeedAuth;
