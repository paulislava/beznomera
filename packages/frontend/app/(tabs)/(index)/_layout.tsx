import { FontAwesome } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React from 'react';
import { Pressable } from 'react-native';
import { Link } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

export default function IndexLayout() {
  const colorScheme = useColorScheme();

  return (
    <>
      <Stack initialRouteName='index'>
        <Stack.Screen
          name='index'
          options={{
            title: 'Мои авто',
            headerRight: () => (
              <Link href='/car/new' asChild>
                <Pressable>
                  {({ pressed }) => (
                    <FontAwesome
                      name='plus'
                      size={25}
                      color={Colors[colorScheme ?? 'light'].text}
                      style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                    />
                  )}
                </Pressable>
              </Link>
            )
          }}
        />
        <Stack.Screen
          name='car/new'
          options={{
            title: 'Добавить авто'
          }}
        />
        <Stack.Screen name='car/[id]' options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
