import React, {  } from 'react';
import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import styled from 'styled-components/native';
import useNeedAuth from '@/hooks/useNeedAuth';
import Head from 'expo-router/head';
import { carService } from '@/services';
import { useAPI } from '@/utils/api';

const StyledTitle = styled(Text)`
  font-size: 20px;
  font-weight: bold;
  color: red;
`;

function TabOneScreen() {
  useNeedAuth();

  const cars = useAPI(carService.list);

  return (
    <View style={styles.container}>
      <Head>
        <title>Мои авто</title>
      </Head>
      
      {cars?.map(car => <div>{JSON.stringify(car)}</div>)}
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

export default TabOneScreen;
