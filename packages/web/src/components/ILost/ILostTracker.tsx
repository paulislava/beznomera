'use client';

import { useCallback, useState } from 'react';
import styled from 'styled-components';
import { Form } from '@/ui/FormContainer/FormContainer';
import { SelectField } from '@/ui/Select/SelectField';
import { useLostSync } from '@/hooks/useLostSync';
import { LostItemInfo, LossStats } from '@shared/lost/lost.types';
import { processFormSubmit } from '@/utils/forms';
import { lostService } from '@/services';

// SelectField stores selected keys as strings
interface FormData {
  itemId: string | null;
}

type Props = {
  initialStats: LossStats;
  initialItems: LostItemInfo[];
};

export function ILostTracker({ initialStats, initialItems }: Props) {
  const { stats, items, recordLoss, addItem, isOnline } = useLostSync(initialStats, initialItems);
  const [inputValue, setInputValue] = useState('');
  const [shortcutLoading, setShortcutLoading] = useState(false);

  const matchesExisting = items.some(i => i.name.toLowerCase() === inputValue.toLowerCase().trim());
  const showAddButton = inputValue.trim().length > 0 && !matchesExisting;

  const onSubmit = useCallback(
    async (data: FormData) => {
      if (!data.itemId) return;
      await processFormSubmit(recordLoss(Number(data.itemId)), undefined, 'Ошибка при записи');
    },
    [recordLoss]
  );

  return (
    <Wrapper>
      {!isOnline && <OfflineBadge>Офлайн — данные синхронизируются при подключении</OfflineBadge>}

      <StatsRow>
        <StatCard>
          <StatValue>{stats.today}</StatValue>
          <StatLabel>за сутки</StatLabel>
        </StatCard>
        <StatCard $accent>
          <StatValue $large>{stats.total}</StatValue>
          <StatLabel>всего</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.week}</StatValue>
          <StatLabel>за неделю</StatLabel>
        </StatCard>
      </StatsRow>

      <Form<FormData> initialValues={{ itemId: null }} onSubmit={onSubmit}>
        {({ handleSubmit, submitting, values }) => {
          const selectedItem = items.find(i => String(i.id) === values.itemId);

          const handleAddItem = async () => {
            try {
              await addItem(inputValue.trim());
              setInputValue('');
            } catch {}
          };

          const handleDownloadShortcut = async () => {
            if (!values.itemId || shortcutLoading) return;
            setShortcutLoading(true);
            try {
              const { token } = await lostService.getOrCreateShortcut({
                itemId: Number(values.itemId)
              });
              window.location.href = `/api/lost/shortcut/${token}/file`;
            } catch {
            } finally {
              setShortcutLoading(false);
            }
          };

          return (
            <>
              <SelectField<FormData>
                name='itemId'
                label='Что потерял(а)'
                options={items as any[]}
                optionKey='id'
                optionValue='name'
                required
                onInputChange={setInputValue}
              />

              {showAddButton && (
                <AddItemButton type='button' onClick={handleAddItem}>
                  + Добавить «{inputValue.trim()}» в базу
                </AddItemButton>
              )}

              <LossButton
                type='button'
                onClick={handleSubmit}
                disabled={submitting || !values.itemId}
              >
                <span>😔</span>
                <span>
                  Я потеряла
                  {selectedItem ? ` ${selectedItem.name}` : ''}
                </span>
              </LossButton>

              <ShortcutButton
                type='button'
                onClick={handleDownloadShortcut}
                disabled={shortcutLoading || !values.itemId}
              >
                <ShortcutIcon />
                <span>{shortcutLoading ? 'Создаём...' : 'Скачать команду'}</span>
              </ShortcutButton>
            </>
          );
        }}
      </Form>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  max-width: 480px;
  margin: 0 auto;
  padding: 32px 16px 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
`;

const OfflineBadge = styled.div`
  background: #fef3c7;
  color: #92400e;
  font-size: 0.8rem;
  padding: 8px 16px;
  border-radius: 8px;
  text-align: center;
  width: 100%;
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  width: 100%;
`;

const StatCard = styled.div<{ $accent?: boolean }>`
  background: var(--heroui-content1);
  border: 1px solid
    ${({ $accent }) => ($accent ? 'var(--heroui-primary)' : 'var(--heroui-divider)')};
  border-radius: 16px;
  padding: 16px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
`;

const StatValue = styled.div<{ $large?: boolean }>`
  font-size: ${({ $large }) => ($large ? '2.4rem' : '2rem')};
  font-weight: 800;
  line-height: 1;
  color: ${({ $large }) => ($large ? 'inherit' : 'var(--heroui-primary)')};
`;

const StatLabel = styled.div`
  font-size: 0.7rem;
  opacity: 0.6;
  text-align: center;
`;

const LossButton = styled.button`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #a855f7, #7c3aed);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition:
    transform 0.12s,
    box-shadow 0.12s;
  box-shadow: 0 8px 32px rgba(124, 58, 237, 0.35);
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  text-align: center;
  padding: 0 20px;

  span:first-child {
    font-size: 2rem;
  }

  &:active:not(:disabled) {
    transform: scale(0.93);
    box-shadow: 0 4px 16px rgba(124, 58, 237, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const AddItemButton = styled.button`
  width: 100%;
  background: none;
  border: 1px dashed var(--heroui-primary);
  border-radius: 10px;
  color: var(--heroui-primary);
  font-size: 0.85rem;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: rgba(124, 58, 237, 0.06);
  }
`;

const ShortcutButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 0 auto;
  padding: 14px 28px;
  min-width: 220px;
  background: linear-gradient(160deg, #7b6fe8 0%, #5e5ce6 45%, #3a38b0 100%);
  border: none;
  border-radius: 16px;
  color: #fff;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 6px 24px rgba(94, 92, 230, 0.45);
  transition:
    transform 0.12s,
    box-shadow 0.12s;
  -webkit-tap-highlight-color: transparent;
  user-select: none;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    box-shadow: none;
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
    box-shadow: 0 3px 12px rgba(94, 92, 230, 0.35);
  }
`;

function ShortcutIcon() {
  return (
    <svg width='34' height='34' viewBox='0 0 34 34' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <rect x='1' y='9' width='19' height='19' rx='5' fill='white' transform='rotate(-18 10 18)' />
      <rect
        x='14'
        y='6'
        width='19'
        height='19'
        rx='5'
        fill='white'
        opacity='0.55'
        transform='rotate(18 23 15)'
      />
    </svg>
  );
}
