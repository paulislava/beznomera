import { useColorScheme as useScheme } from 'react-native';

export const useColorScheme = () => {
  const scheme = useScheme();
  return scheme ?? 'dark';
};
