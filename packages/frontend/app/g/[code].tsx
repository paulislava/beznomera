import { Text, View } from '@/components/Themed';
import useSetTitle from '@/hooks/useSetTitle';
import { carService } from '@/services';
import { CarInfo } from '@shared/car/car.types';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';

const CallUserPage = () => {
  const { code } = useLocalSearchParams<{ code: string }>();
  const [requested, setRequested] = useState(false);
  const [info, setInfo] = useState<CarInfo | null>(null);
  useSetTitle(info ? `${info.owner?.nickname}: информация об авто` : 'Информация об авто');

  useEffect(() => {
    carService
      .info(code)
      .then(info => {
        setRequested(true);
        console.log(info);
        setInfo(info);
      })
      .catch(() => {
        setRequested(true);
      });
  }, [code]);

  return (
    <View fullHeight center>
      {requested && !info && <Text>Ошибка: ссылка недействительна</Text>}
      <div>Code: {code}</div>
      {info && <Text>{JSON.stringify(info)}</Text>}
    </View>
  );
};

export default CallUserPage;
