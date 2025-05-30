import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet } from 'react-native';
import { Text, PageView } from '@/components/Themed';

export default function ModalScreen() {
  return (
    <PageView style={styles.container}>
      <Text style={styles.title}>Modal</Text>
      <PageView style={styles.separator} lightColor='#eee' darkColor='rgba(255,255,255,0.1)' />
      Test modal
      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </PageView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%'
  }
});
