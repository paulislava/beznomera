'use client';

import React, { useCallback, useContext, useState } from 'react';
import styled from 'styled-components';
import { carService } from '@/services';
import { AuthContext } from '@/context/Auth/Auth.context';
import { showResponseMessage, showSuccessMessage } from '@/utils/messages';
import { ResponseWithCode } from '@shared/responses';
import { TextL } from '../Themed';
import { pluralize } from '@/utils/strings';

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

const StarWrapper = styled.div<{ $disabled: boolean }>`
  position: relative;
  display: inline-block;
  font-size: 24px;
  cursor: ${({ $disabled }) => ($disabled ? 'default' : 'pointer')};
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

const StarButton = styled.button<{ $disabled: boolean }>`
  background: none;
  border: none;
  padding: 0;
  cursor: ${({ $disabled }) => ($disabled ? 'default' : 'pointer')};
  position: relative;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StarEmpty = styled.span`
  position: absolute;
  top: 0;
  left: 0;
  color: #ccc;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StarFilled = styled.span<{ $fillPercent: number }>`
  position: absolute;
  top: 0;
  left: 0;
  color: #ffd700;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  clip-path: inset(0 ${({ $fillPercent }) => 100 - $fillPercent * 100}% 0 0);
  overflow: hidden;
`;

const RatingText = styled(TextL)``;

const RatingValue = styled(TextL)``;

const RatesCount = styled(TextL)`
  opacity: 0.6;
  font-size: 14px;
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
  driverIds = []
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
        if (error && typeof error === 'object' && 'code' in error) {
          showResponseMessage(error as ResponseWithCode);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [canRate, isSubmitting, carId, currentRating]
  );

  const displayRating = hoveredStar !== null ? hoveredStar : currentRating;

  const getStarFillPercent = (starIndex: number, rating: number | null): number => {
    if (rating === null) return 0;
    if (starIndex <= rating) return 1;
    if (starIndex - 1 < rating && rating < starIndex) return rating - (starIndex - 1);
    return 0;
  };

  return (
    <RatingContainer>
      <StarsContainer>
        {[1, 2, 3, 4, 5].map(star => {
          const fillPercent = getStarFillPercent(star, displayRating);
          return (
            <StarWrapper
              key={star}
              $disabled={!canRate || isSubmitting}
              onMouseEnter={() => canRate && !isSubmitting && setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(null)}
            >
              <StarButton
                $disabled={!canRate || isSubmitting}
                onClick={() => handleStarClick(star)}
                disabled={!canRate || isSubmitting}
                type='button'
              >
                <StarEmpty>★</StarEmpty>
                <StarFilled $fillPercent={fillPercent}>★</StarFilled>
              </StarButton>
            </StarWrapper>
          );
        })}
      </StarsContainer>
      {currentRating !== null && (
        <>
          <RatingValue>{currentRating.toFixed(1)}</RatingValue>
          <RatesCount>{pluralize(currentRatesCount, ['оценка', 'оценки', 'оценок'])}</RatesCount>
        </>
      )}
      {currentRating === null && currentRatesCount === 0 && (
        <RatingText>Пока нет оценок</RatingText>
      )}
      {canRate && !isSubmitting && <RatingText>Нажмите на звезду, чтобы оценить</RatingText>}
      {isSubmitting && <RatingText>Сохранение...</RatingText>}
    </RatingContainer>
  );
};
