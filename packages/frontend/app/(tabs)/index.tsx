import React from 'react';
import { StyleSheet } from 'react-native';
import { View } from '@/components/Themed';
import useNeedAuth from '@/hooks/useNeedAuth';
import Head from 'expo-router/head';
import { carService } from '@/services';
import { useAPI } from '@/utils/api';

function TabOneScreen() {
  useNeedAuth();

  const cars = useAPI(carService.list);

  return (
    <View style={styles.container}>
      <Head>
        <title>Мои авто</title>
      </Head>

      {cars?.map(car => (
        <div key={car.no}>{JSON.stringify(car)}</div>
      ))}
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
