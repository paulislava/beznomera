import React from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { PageView } from '@/components/Themed';
import useNeedAuth from '@/hooks/useNeedAuth';
import Head from 'expo-router/head';
import { carService } from '@/services';
import { useAPI } from '@/utils/api';
import styled from 'styled-components/native';
import { TextL } from '@/components/Themed';
import { Glass } from '@/ui/Glass';
import { Link } from 'expo-router';

export const ScrollContainer = styled(ScrollView)`
  width: 100%;
`;

export const Container = styled(View)`
  max-width: 500px;
  display: flex;
  flex-flow: column;
  gap: 10px;
  margin: auto;
  justify-content: center;
  width: 100%;
  padding: 20px 0;
  height: 100%;
`;

export const CarItem = styled(Pressable)`
  cursor: pointer;
  display: flex;
  flex-flow: row;
  gap: 10px;
  width: 100%;
  padding: 10px 20px;
  border-radius: 10px;
  align-items: center;
  justify-content: space-between;
  height: 100px;
  backdrop-filter: blur(10px);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
`;

function CarsList() {
  useNeedAuth();

  const cars = useAPI(carService.list);

  return (
    <PageView fullHeight>
      <Head>
        <title>Мои авто</title>
      </Head>

      {cars && (
        <Container>
          {cars.map(car => (
            <Link key={car.no} href={`/car/${car.id}/`} asChild>
              <CarItem>
                <Glass />
                <TextL>{car.no}</TextL>
                <TextL>
                  {car.brandRaw || car.brand?.title} {car.model}
                </TextL>
              </CarItem>
            </Link>
          ))}
        </Container>
      )}
    </PageView>
  );
}

export default CarsList;
