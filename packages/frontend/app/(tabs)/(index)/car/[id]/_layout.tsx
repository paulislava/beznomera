import { Stack } from 'expo-router';
import React from 'react';

export const unstable_settings = {
  // Ensure any route can link back to `/`
  initialRouteName: 'index'
};

export default function CarLayout() {
  return (
    <>
      <Stack initialRouteName='index'>
        <Stack.Screen name='index' />
        <Stack.Screen name='edit' />
      </Stack>
    </>
  );
}
