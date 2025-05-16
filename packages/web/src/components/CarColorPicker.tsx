import { styled } from 'styled-components';
import webStyled from 'styled-components';
import { CarImage } from '@/components/CarImage/CarImage';
import { Creatable } from '@shared/forms';
import { ColorInfo, RgbColor } from '@shared/car/car.types';
import { FieldRenderProps } from 'react-final-form';
import React, { useCallback, useMemo } from 'react';

const StyledCarImage = styled(CarImage)`
  width: 100%;
  height: 100%;
`;

type CarColorPickerProps = FieldRenderProps<Creatable<ColorInfo, RgbColor>>;

const Label = webStyled.label`
  position: relative;
  display: block;

  max-width: 400px;
  width: 100%;
  margin: 20px 0;

  &>input {
    opacity: 0;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }
`;

export const CarColorPicker = ({ input: { value, onChange } }: CarColorPickerProps) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const hex = e.target.value;
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      onChange({ ...value, newValue: { r, g, b } });
    },
    [onChange, value]
  );

  const hexValue = useMemo(
    () =>
      value?.newValue
        ? `#${value.newValue.r.toString(16).padStart(2, '0')}${value.newValue.g
            .toString(16)
            .padStart(2, '0')}${value.newValue.b.toString(16).padStart(2, '0')}`
        : '#000000',
    [value]
  );

  return (
    <Label>
      <input type='color' value={hexValue} onChange={handleChange} />
      <StyledCarImage color={value?.newValue ?? value?.value?.value} animated={false} />
    </Label>
  );
};
