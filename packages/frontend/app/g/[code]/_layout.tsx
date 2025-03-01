import { Stack } from 'expo-router';
import React from 'react';

export const unstable_settings = {
  // Ensure any route can link back to `/`
  initialRouteName: 'index'
};

export default function CodeLayout() {
  return (
    <>
      <Stack initialRouteName='index'>
        <Stack.Screen name='index' options={{ headerShown: false }} />
        <Stack.Screen
          name='chat'
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
            headerShown: true,
            title: 'Чат с водителем'
          }}
        />
      </Stack>
    </>
  );
}
