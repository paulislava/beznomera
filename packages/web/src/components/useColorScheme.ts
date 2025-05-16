import { useEffect, useState } from 'react';
export const useColorScheme = () => {
  const [scheme, setScheme] = useState<ColorSchemeName>(null);

  useEffect(() => {
    setScheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }, []); 

  return scheme;
};
