import { CompareProps, OptionProps } from '../Select.types';
import * as S from '../Select.styled';
import React, { useCallback } from 'react';

type DropdownProps<
  OptionValue,
  ValueType extends OptionProps<OptionValue> | OptionProps<OptionValue>[] = OptionProps<OptionValue>
> = {
  options: OptionProps<OptionValue>[];
  value: Maybe<ValueType>;
  onChange: (option: ValueType) => void;
} & CompareProps<OptionValue>;

export function Dropdown<OptionValue>({
  options,
  value,
  onChange,
  comparer
}: DropdownProps<OptionValue>) {
  const compareOptions = useCallback(
    (a: OptionProps<OptionValue>, b: OptionProps<OptionValue>) =>
      comparer
        ? comparer(a.value, b.value)
        : a.value === b.value || (a.label ? a.label === b.label : false),
    [comparer]
  );

  return (
    <>
      {options.map((option, index) => (
        <S.DropdownItem
          key={index}
          $active={value ? compareOptions(option, value) : false}
          onClick={() => {
            onChange(option);
          }}
        >
          {option.label || String(option.value)}
        </S.DropdownItem>
      ))}
    </>
  );
}

type DropdownMultipleProps<OptionValue> = DropdownProps<OptionValue, OptionProps<OptionValue>[]>;

export function DropdownMultiple<OptionValue>({
  options,
  value,
  onChange,
  comparer
}: DropdownMultipleProps<OptionValue>) {
  const compareOptions = useCallback(
    (a: OptionProps<OptionValue>, b: OptionProps<OptionValue>) =>
      comparer
        ? comparer(a.value, b.value)
        : a.value === b.value || (a.label ? a.label === b.label : false),
    [comparer]
  );

  return (
    <>
      {options.map((option, index) => {
        const isActive = !!value?.some(valueOption => compareOptions(option, valueOption));

        return (
          <S.MultipleDropdownItem
            key={index}
            $active={isActive}
            onClick={() => {
              if (isActive) {
                const newValue = [...(value || [])];

                const index = newValue.findIndex(val => compareOptions(val, option));
                if (index > -1) {
                  newValue.splice(index, 1);
                }

                onChange(newValue);
              } else {
                onChange([...(value || []), option]);
              }
            }}
          >
            {option.label || String(option.value)}
          </S.MultipleDropdownItem>
        );
      })}
    </>
  );
}
