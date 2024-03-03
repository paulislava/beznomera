import PageContext from '@/contexts/PageContext';
import { useFocusEffect } from 'expo-router';
import { useContext, useEffect } from 'react';

const useSetTitle = (title: string) => {
  const { setTitle } = useContext(PageContext);

  useFocusEffect(() => {
    setTitle(title);
  });

  useEffect(() => {
    setTitle(title);
  }, [title]);
};

export default useSetTitle;
