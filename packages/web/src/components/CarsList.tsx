'use client';

import React, { FC } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { useAPI } from '@/utils/api-service';
import { carService } from '@/services';
import { ShortCarInfo } from '@shared/car/car.types';
import { TextL } from './Themed';
import { Glass } from '@/ui/Glass';
import { Button } from '@/ui/Button';

const Container = styled.div`
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: auto;
  justify-content: center;
  width: 100%;
  padding: 20px 0;
  height: 100%;
  align-items: center;
`;

const CarItem = styled(Link)`
  cursor: pointer;
  display: flex;
  flex-direction: row;
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
  text-decoration: none;
  color: inherit;
  position: relative;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
    transition: all 0.2s ease;
  }
`;

const AddButton = styled(Button)`
  margin: 20px auto 0;
`;

const CarInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
`;

const CarNumber = styled(TextL)`
  font-weight: 600;
  font-size: 16px;
`;

const CarModel = styled(TextL)`
  font-weight: 400;
  font-size: 14px;
  opacity: 0.8;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
`;

const ErrorContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #ff4444;
`;

export const CarsList: FC<{ cars: ShortCarInfo[] }> = ({ cars }) => {
  if (!cars || cars.length === 0) {
    return (
      <Container>
        <TextL style={{ textAlign: 'center', marginBottom: '20px' }}>
          У вас пока нет автомобилей
        </TextL>
        <Link href='/car/new' passHref>
          <AddButton view='glass'>Добавить автомобиль</AddButton>
        </Link>
      </Container>
    );
  }

  return (
    <Container>
      {cars.map((car: ShortCarInfo) => (
        <CarItem key={car.no} href={`/car/${car.id}/`}>
          <Glass />
          <CarInfo>
            <CarNumber>{car.no}</CarNumber>
            <CarModel>
              {car.brandRaw || car.brand?.title} {car.model}
            </CarModel>
          </CarInfo>
        </CarItem>
      ))}
      <Link href='/car/new' passHref>
        <AddButton view='glass'>Добавить автомобиль</AddButton>
      </Link>
    </Container>
  );
};
