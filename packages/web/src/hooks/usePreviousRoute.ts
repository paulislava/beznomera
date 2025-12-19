// hooks/usePreviousRoute.js or .tsx
'use client';

import { useEffect, useRef } from 'react';
// For App Router:
import { usePathname } from 'next/navigation';
// For Pages Router, import useRouter from 'next/router' and use 'asPath'

export const usePreviousRoute = () => {
  // Use usePathname() for App Router (Next.js 13/14+)
  const pathname = usePathname();
  // Or if using Pages Router: const { asPath: pathname } = useRouter();

  const ref = useRef<string>(null);

  useEffect(() => {
    ref.current = pathname;
  }, [pathname]);

  return ref.current;
};
