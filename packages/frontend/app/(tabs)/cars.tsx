import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import styled from 'styled-components/native';
import useNeedAuth from '@/hooks/useNeedAuth';
import Head from 'expo-router/head';
import { carService } from '@/services';
import { ShortCarInfo } from '@shared/car/car.types';

const StyledTitle = styled(Text)`
  font-size: 20px;
  font-weight: bold;
  color: red;
`;

function TabOneScreen() {
  useNeedAuth();

  const [cars, setCars] = useState<ShortCarInfo[]>();

  useEffect(() => {
    carService.list().then(setCars);
  }, []);

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
