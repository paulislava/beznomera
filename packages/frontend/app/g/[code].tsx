import Button from '@/components/Button/Button';
import { Text, View } from '@/components/Themed';
import useSetTitle from '@/hooks/useSetTitle';
import { carService } from '@/services';
import { CarInfo } from '@shared/car/car.types';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';

const CallUserPage = () => {
  const { code } = useLocalSearchParams<{ code: string }>();
  const [requested, setRequested] = useState(false);
  const [info, setInfo] = useState<CarInfo | null>(null);
  const [called, setCalled] = useState(false);

  useSetTitle(info ? `${info.owner?.nickname}: информация об авто` : 'Информация об авто');

  useEffect(() => {
    carService
      .info(code)
      .then(info => {
        setRequested(true);
        setInfo(info);
      })
      .catch(() => {
        setRequested(true);
      });
  }, [code]);

  const callHandler = useCallback(() => {
    carService
      .call(code)
      .then(() => {
        setCalled(true);
      })
      .catch(error => {
        alert(error);
      });
  }, []);

  return (
    <View fullHeight center>
      {requested && !info && <Text>Ошибка: ссылка недействительна</Text>}
      <div>Code: {code}</div>
      {info && (
        <>
          <Text>{JSON.stringify(info)}</Text>
          <Button onClick={callHandler}>{called ? 'Запрос отправлен!' : 'Позвать водителя'}</Button>
        </>
      )}
    </View>
  );
};

export default CallUserPage;
