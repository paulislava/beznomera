'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { CarDriversInfo, FullCarInfo } from '@shared/car/car.types';
import { carService } from '@/services';
import { Button } from '@/ui/Button';
import { TextL } from '../Themed';
import { CenterContainer } from '@/ui/Styled';
import { showErrorMessage, showSuccessMessage } from '@/utils/messages';
import { formatDate } from '@/utils/date';
import { AddDriverButton } from './AddDriverButton';

const DriversContainer = styled.div`
  margin: 20px 0;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
`;

const DriverItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  margin: 8px 0;
  background-color: white;
  border-radius: 6px;
  border: 1px solid #e9ecef;
`;

const DriverInfo = styled.div`
  flex: 1;
`;

const DriverName = styled(TextL)`
  font-weight: 600;
  margin-bottom: 4px;
`;

const DriverDetails = styled(TextL)`
  font-size: 14px;
  color: #666;
`;

const DriverActions = styled.div`
  display: flex;
  gap: 8px;
`;

const OwnerBadge = styled.span`
  background-color: #28a745;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  margin-left: 8px;
`;

const Header = styled.div`
  display: flex;
  flex-flow: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 8px;
`;

interface CarDriversProps {
  info: FullCarInfo;
  isOwner: boolean;
}

export const CarDrivers: React.FC<CarDriversProps> = ({ info, isOwner }) => {
  const { id: carId } = info;
  const [driversInfo, setDriversInfo] = useState<CarDriversInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadDrivers = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await carService.getDrivers(carId);
      setDriversInfo(data);
    } catch (error: any) {
      console.error('Failed to load drivers:', error);
      showErrorMessage('Ошибка', 'Не удалось загрузить список водителей');
    } finally {
      setIsLoading(false);
    }
  }, [carId]);

  const handleRemoveDriver = async (driverId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этого водителя?')) {
      return;
    }

    try {
      await carService.removeDriver(carId, driverId);
      showSuccessMessage('Успех', 'Водитель успешно удален');
      await loadDrivers();
    } catch (error: any) {
      console.error('Failed to remove driver:', error);
      showErrorMessage('Ошибка', 'Не удалось удалить водителя');
    }
  };

  useEffect(() => {
    loadDrivers();
  }, [carId, loadDrivers]);

  if (isLoading) {
    return (
      <DriversContainer>
        <CenterContainer>
          <TextL>Загрузка списка водителей...</TextL>
        </CenterContainer>
      </DriversContainer>
    );
  }

  if (!driversInfo) {
    return null;
  }

  const allDrivers = [driversInfo.owner, ...driversInfo.drivers];

  return (
    <DriversContainer>
      <Header>
        <TextL style={{ fontWeight: '600' }}>Водители автомобиля</TextL>
        <AddDriverButton onSuccess={loadDrivers} carId={info.id} eventData={{ code: info.code }} />
      </Header>
      {allDrivers.map(driver => (
        <DriverItem key={driver.id}>
          <DriverInfo>
            <DriverName>
              {driver.firstName} {driver.lastName || ''}
              {driver.isOwner && <OwnerBadge>Владелец</OwnerBadge>}
            </DriverName>
            <DriverDetails>
              {driver.nickname && `@${driver.nickname}`}
              {driver.tel && driver.nickname && ' • '}
              {driver.tel}
              <br />
              Добавлен: {formatDate(driver.addedAt)}
            </DriverDetails>
          </DriverInfo>

          {isOwner && !driver.isOwner && (
            <DriverActions>
              <Button view='danger' onClick={() => handleRemoveDriver(driver.id)}>
                Удалить
              </Button>
            </DriverActions>
          )}
        </DriverItem>
      ))}
    </DriversContainer>
  );
};
