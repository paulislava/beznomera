'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { Form } from '@/ui/FormContainer/FormContainer';
import { SelectField } from '@/ui/Select/SelectField';
import { useLostSync } from '@/hooks/useLostSync';
import { LostItemInfo, LossStats, LostItemStats } from '@shared/lost/lost.types';
import { lostService } from '@/services';

interface FormData {
  itemId: string | null;
}

type Props = {
  initialStats: LossStats;
  initialItems: LostItemInfo[];
  initialItemStats: LostItemStats[];
};

export function ILostTracker({ initialStats, initialItems, initialItemStats }: Props) {
  const { itemStats, items, recordLoss, addItem, isOnline, lastItemId } = useLostSync(
    initialStats,
    initialItems,
    initialItemStats
  );
  const [inputValue, setInputValue] = useState('');
  const [shortcutLoading, setShortcutLoading] = useState(false);
  const [lossLoading, setLossLoading] = useState(false);
  const [selectKey, setSelectKey] = useState(0);

  return (
    <Wrapper>
      {!isOnline && <OfflineBadge>Офлайн — данные синхронизируются при подключении</OfflineBadge>}

      {itemStats.length > 0 && (
        <StatsList>
          {itemStats.map(s => (
            <StatsItem key={s.itemId}>
              <StatsItemName>{s.name}</StatsItemName>
              <StatsPills>
                <StatsPill>{s.today} сег</StatsPill>
                <StatsPill>{s.week} нед</StatsPill>
                <StatsPill>{s.total} всего</StatsPill>
              </StatsPills>
            </StatsItem>
          ))}
        </StatsList>
      )}

      <Form<FormData> initialValues={{ itemId: lastItemId }} onSubmit={() => {}}>
        {({ values, form }) => {
          const selectedItem = items.find(i => String(i.id) === values.itemId);
          const typedNew = !values.itemId && inputValue.trim().length > 0;
          const canLose = !!(values.itemId || typedNew);
          const displayName = selectedItem?.name ?? (typedNew ? inputValue.trim() : '');

          const handleLoss = async () => {
            if (lossLoading || !canLose) return;
            setLossLoading(true);
            try {
              if (values.itemId) {
                await recordLoss(Number(values.itemId));
              } else if (inputValue.trim()) {
                const newItem = await addItem(inputValue.trim());
                await recordLoss(newItem.id);
                form.change('itemId', String(newItem.id));
                setSelectKey(k => k + 1);
              }
            } catch {
            } finally {
              setLossLoading(false);
            }
          };

          const handleDownloadShortcut = async () => {
            if (!values.itemId || shortcutLoading) return;
            setShortcutLoading(true);
            try {
              const { token, itemName } = await lostService.getOrCreateShortcut({
                itemId: Number(values.itemId)
              });
              const fileUrl = `${window.location.origin}/api/lost/shortcut/${token}/file`;
              try {
                await navigator.clipboard.writeText(fileUrl);
              } catch {}
              window.location.href = `shortcuts://import-shortcut?url=${encodeURIComponent(fileUrl)}&name=${encodeURIComponent('iloss ' + itemName)}`;
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
                onInputChange={setInputValue}
                allowsCustomValue
                onEnterKey={handleLoss}
              />

              <LossButton type='button' onClick={handleLoss} disabled={lossLoading || !canLose}>
                <span>😔</span>
                <span>Я потеряла{displayName ? ` ${displayName}` : ''}</span>
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

const StatsList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StatsItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--heroui-content1);
  border: 1px solid var(--heroui-divider);
  border-radius: 12px;
  padding: 10px 14px;
  gap: 8px;
`;

const StatsItemName = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StatsPills = styled.div`
  display: flex;
  gap: 6px;
  flex-shrink: 0;
`;

const StatsPill = styled.span`
  font-size: 0.72rem;
  opacity: 0.65;
  background: var(--heroui-default-100);
  border-radius: 999px;
  padding: 2px 8px;
  white-space: nowrap;
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
