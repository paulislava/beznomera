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
  const [selectKey, setSelectKey] = useState(0);

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
        {({ handleSubmit, submitting, values, form }) => {
          const selectedItem = items.find(i => String(i.id) === values.itemId);

          const handleAddItem = async () => {
            try {
              const newItem = await addItem(inputValue.trim());
              form.change('itemId', String(newItem.id));
              setInputValue('');
              setSelectKey(k => k + 1);
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
                key={selectKey}
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
  justify-self: center;
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
  width: fit-content;
  background: #1c2145;
  border: none;
  border-radius: 18px;
  color: #fff;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 6px 24px rgba(28, 33, 69, 0.55);
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
    box-shadow: 0 3px 12px rgba(28, 33, 69, 0.4);
  }
`;

function ShortcutIcon() {
  return (
    <svg width='40' height='46' viewBox='0 0 40 46' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <defs>
        <linearGradient id='sc_pink' gradientUnits='userSpaceOnUse' x1='38' y1='0' x2='2' y2='32'>
          <stop offset='0%' stopColor='#F5859C' />
          <stop offset='100%' stopColor='#D04468' />
        </linearGradient>
        <linearGradient id='sc_teal' gradientUnits='userSpaceOnUse' x1='2' y1='14' x2='38' y2='46'>
          <stop offset='0%' stopColor='#4ECDB8' />
          <stop offset='100%' stopColor='#3580F0' />
        </linearGradient>
      </defs>
      <rect
        x='-13'
        y='-13'
        width='26'
        height='26'
        rx='6'
        fill='url(#sc_pink)'
        transform='translate(20, 16) rotate(45)'
      />
      <rect
        x='-13'
        y='-13'
        width='26'
        height='26'
        rx='6'
        fill='url(#sc_teal)'
        opacity='0.92'
        transform='translate(20, 30) rotate(45)'
      />
    </svg>
  );
}
