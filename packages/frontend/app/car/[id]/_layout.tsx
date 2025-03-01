import { Stack } from 'expo-router';
import React from 'react';

export default function CarLayout() {
  return (
    <>
      <Stack initialRouteName='index'>
        <Stack.Screen name='index' />
      </Stack>
    </>
  );
}
