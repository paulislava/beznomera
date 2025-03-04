import { authService } from '@/services';
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
    authService
      .checkAuthorized()
      .then(() => {
        setRequested(true);

        setAuthorized(true);
        props?.onAuth?.();
      })
      .catch(() => {
        setRequested(true);
        setAuthorized(false);
        router.replace(`/login`);
        router.setParams({ to: pathname });
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
