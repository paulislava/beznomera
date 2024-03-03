import { IS_WEB, SITE_TITLE } from '@/constants/site';
import { PropsWithChildren, createContext, useCallback, useEffect, useMemo, useState } from 'react';

export interface PageContextProps {
  title?: string;
  setTitle(title: string): void;
}

const PageContext = createContext<PageContextProps>({
  setTitle: () => {
    return;
  }
});

export function PageContextProvider({ children }: PropsWithChildren) {
  const [pageTitle, setPageTitle] = useState<string>();

  useEffect(() => {
    if (IS_WEB) {
      document.title = SITE_TITLE;
    }
  }, []);

  const updatePageTitle = useCallback((title: string) => {
    if (IS_WEB) {
      setPageTitle(title);
      document.title = title;
    }
  }, []);

  const pageContextValue: PageContextProps = useMemo(
    () => ({ title: pageTitle, setTitle: updatePageTitle }),
    [pageTitle, updatePageTitle]
  );

  return <PageContext.Provider value={pageContextValue}>{children}</PageContext.Provider>;
}

export default PageContext;
