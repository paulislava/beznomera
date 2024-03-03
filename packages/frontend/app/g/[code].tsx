import { Text, View } from '@/components/Themed';
import { carService } from '@/services';
import { CarInfo } from '@shared/car/car.types';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';

const CallUserPage = () => {
  const { code } = useLocalSearchParams<{ code: string }>();
  const [requested, setRequested] = useState(false);
  const [info, setInfo] = useState<CarInfo | null>(null);

  useEffect(() => {
    carService
      .info(code)
      .then(info => {
        setRequested(true);
        setInfo(info);
      })
      .then(() => {
        setRequested(true);
      });
  }, [code]);

  return (
    <View fullHeight center>
      {requested && !info && <Text>Ошибка: ссылка недействительна</Text>}
      <div>Code: ${code}</div>
      {info && <Text>{JSON.stringify(info)}</Text>}
    </View>
  );
};

export default CallUserPage;
