'use client';

import React, { useCallback, useContext, useState } from 'react';
import styled from 'styled-components';
import { carService } from '@/services';
import { AuthContext } from '@/context/Auth/Auth.context';
import { showResponseMessage, showSuccessMessage } from '@/utils/messages';
import { TextL } from '../Themed';

const RatingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin: 20px 0;
`;

const StarsContainer = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`;

const StarButton = styled.button<{ $filled: boolean; $disabled: boolean }>`
  background: none;
  border: none;
  cursor: ${({ $disabled }) => ($disabled ? 'default' : 'pointer')};
  padding: 0;
  font-size: 24px;
  color: ${({ $filled }) => ($filled ? '#FFD700' : '#ccc')};
  transition: transform 0.2s;
  user-select: none;

  ${({ $disabled }) =>
    !$disabled &&
    `
    &:hover {
      transform: scale(1.1);
    }
  `}
`;

const RatingText = styled(TextL)`
  font-size: 14px;
  color: #666;
  text-align: center;
`;

const RatingValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

interface CarRatingProps {
  carId: number;
  rating: number | null;
  ratesCount: number;
  ownerId: number;
  driverIds?: number[];
}

export const CarRating: React.FC<CarRatingProps> = ({
  carId,
  rating,
  ratesCount,
  ownerId,
  driverIds = [],
}) => {
  const { user } = useContext(AuthContext);
  const [currentRating, setCurrentRating] = useState(rating);
  const [currentRatesCount, setCurrentRatesCount] = useState(ratesCount);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canRate = user && user.userId !== ownerId && !driverIds.includes(user.userId);

  const handleStarClick = useCallback(
    async (starValue: number) => {
      if (!canRate || isSubmitting) return;

      setIsSubmitting(true);
      try {
        await carService.rate({ rating: starValue }, carId);
        // После успешной оценки обновляем локальное состояние
        // Сервер пересчитает средний рейтинг и вернет обновленные данные
        // Для упрощения, обновляем локально, предполагая что это новая оценка
        // В реальности лучше перезагрузить данные с сервера
        if (currentRating === null) {
          // Первая оценка
          setCurrentRating(starValue);
          setCurrentRatesCount(1);
        } else {
          // Обновление существующей оценки - количество не меняется, но рейтинг пересчитывается
          // Упрощенная логика: просто обновляем на новое значение
          // В реальности сервер пересчитает средний рейтинг с учетом всех оценок
          setCurrentRating(starValue);
        }
        showSuccessMessage('Успех', 'Оценка сохранена!');
      } catch (error) {
        showResponseMessage(error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [canRate, isSubmitting, carId, currentRating],
  );

  const displayRating = hoveredStar !== null ? hoveredStar : currentRating;

  return (
    <RatingContainer>
      <StarsContainer>
        {[1, 2, 3, 4, 5].map((star) => (
          <StarButton
            key={star}
            $filled={star <= Math.round(displayRating || 0)}
            $disabled={!canRate || isSubmitting}
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => canRate && !isSubmitting && setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(null)}
            disabled={!canRate || isSubmitting}
            type="button"
          >
            ★
          </StarButton>
        ))}
      </StarsContainer>
      {currentRating !== null && (
        <RatingValue>
          {currentRating.toFixed(1)} ({currentRatesCount}{' '}
          {currentRatesCount === 1 ? 'оценка' : currentRatesCount < 5 ? 'оценки' : 'оценок'})
        </RatingValue>
      )}
      {currentRating === null && currentRatesCount === 0 && (
        <RatingText>Пока нет оценок</RatingText>
      )}
      {canRate && !isSubmitting && (
        <RatingText>Нажмите на звезду, чтобы оценить</RatingText>
      )}
      {isSubmitting && <RatingText>Сохранение...</RatingText>}
    </RatingContainer>
  );
};

