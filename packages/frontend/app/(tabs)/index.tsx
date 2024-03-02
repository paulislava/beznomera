import React from 'react';
import { StyleSheet } from 'react-native';
import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import styled from 'styled-components/native';

const StyledTitle = styled(Text)`
  font-size: 20px;
  font-weight: bold;
  color: red;
`;

export default function TabOneScreen() {
  return (
    <View style={styles.container}>
      <StyledTitle>Tab One</StyledTitle>
      <View style={styles.separator} lightColor='#eee' darkColor='rgba(255,255,255,0.1)' />
      <EditScreenInfo path='app/(tabs)/index.tsx' />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%'
  }
});
