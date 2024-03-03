import { View } from '@/components/Themed';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

const CallUserPage = () => {
  const { user } = useLocalSearchParams<{ user: string }>();

  return (
    <View fullHeight center>
      <div>User: {user}</div>
    </View>
  );
};

export default CallUserPage;
