import React from 'react';
import { Tabs } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { TabBarIcon } from '@/components/TabBarIcon/TabBarIcon';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: false
      }}
    >
      <Tabs.Screen
        name='(index)'
        options={{
          title: 'Мои авто',
          tabBarIcon: ({ color }) => <TabBarIcon name='car' color={color} />
        }}
      />
    </Tabs>
  );
}
