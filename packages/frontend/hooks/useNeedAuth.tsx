import { authService } from '@/services';
import { useFocusEffect, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

interface UseNeedAuthProps {
  onAuth?(): void | Promise<void>;
}

const useNeedAuth = (props?: UseNeedAuthProps) => {
  const [authorized, setAuthorized] = useState(false);
  const [requested, setRequested] = useState(false);
  const router = useRouter();

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
        router.replace('/login');
      });
  });

  useEffect(() => {
    if (!authorized && requested) {
      router.replace('/login');
    }
  }, [authorized, requested]);

  return authorized;
};

export default useNeedAuth;
