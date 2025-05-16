import styled, { css } from 'styled-components';
import { TextInput } from '../TextInput';
import { cdnIconUrl } from '@/utils/files';
export const Container = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
`;

export const DropdownBase = styled.div`
  display: flex;
  flex-flow: column;
  gap: 4px;
  padding: 8px 6px;
  box-sizing: border-box;
  background: #2d303e;
  border: 1px solid rgb(57, 60, 73);
  /* shadow-m */
  box-shadow: 0px 5px 15px 0px rgba(0, 0, 0, 0.08), 0px 15px 35px -5px rgba(17, 24, 38, 0.15),
    0px 0px 0px 1px rgba(152, 161, 179, 0.1);
  border-radius: 8px;

  margin-top: 6px;
`;

export const Dropdown = styled(DropdownBase)<{
  $isOpen: boolean;
  $position?: 'bottom' | 'top';
}>`
  position: absolute;
  left: 16px;
  right: 16px;
  z-index: 10;
  max-height: 300px;
  overflow-y: auto;

  ${({ $isOpen }) =>
    !$isOpen &&
    css`
      display: none;
    `}

  ${({ $position }) =>
    $position === 'top'
      ? css`
          bottom: 100%;
          margin-top: 0;
          margin-bottom: 6px;
        `
      : $position === 'bottom'
      ? css`
          top: 100%;
          margin-top: 6px;
          margin-bottom: 0;
        `
      : css`
          visibility: hidden;
        `}
`;

const dropdownItemMixin = css`
  padding: 4px 10px;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: 2%;
`;

export const DropdownItem = styled.div<SActiveProps>`
  ${dropdownItemMixin}
  border-radius: 4px;
  padding-right: 24px;
  cursor: pointer;
  position: relative;

  ${({ $active }) =>
    $active &&
    css`
      background: rgb(113, 142, 191);
    `}

  &:hover {
    background: rgba(113, 142, 191, 0.8);
  }

  &::after {
    top: 0;
    content: ' ';
    width: 16px;
    height: 100%;
    position: absolute;
    right: 10px;

    ${({ $active }) =>
      $active &&
      css`
        background-image: url(${cdnIconUrl('checked.png')});
      `}

    background-size: 100% auto;
    background-repeat: no-repeat;
    background-position: center;
  }
`;

export const checkboxMixin = css<SActiveProps>`
  width: 16px;

  ${({ $active }) => css`
    background-image: url(${$active
      ? cdnIconUrl('checked.png')
      : cdnIconUrl('checkbox-unchecked.png')});
  `}

  background-size: 100% auto;
  background-repeat: no-repeat;
  background-position: center;
`;

export const MultipleDropdownItem = styled(DropdownItem)<SActiveProps>`
  &::after {
    top: 0;
    content: ' ';
    height: 100%;
    position: absolute;
    right: 10px;
    ${checkboxMixin}
  }
`;

type InputProps = SOpenProps & { $fillPlaceholder?: boolean };

export const Input = styled(TextInput)<InputProps>`
  cursor: pointer !important;

  ${({ $fillPlaceholder }) =>
    $fillPlaceholder &&
    css`
      & *:not(:focus)::placeholder {
        color: #fff;
      }
    `}

  &::after {
    content: ' ';
    background: url(${cdnIconUrl('dropdown.png')}) no-repeat;
    width: 9px;
    height: 100%;
    position: absolute;
    right: 18px;
    background-size: 100% auto;
    background-position: center;

    transition: transform 0.2s;
    ${({ $isOpen }) =>
      $isOpen &&
      css`
        transform: rotate(180deg);
      `}
  }
`;

export const AddOptionContainer = styled.div`
  background: #2d303e;
  padding-bottom: 8px;
  position: sticky;
  bottom: -8px;
  left: 0;
  margin-bottom: -8px;
`;

// export const AddOptionItem = styled(DropdownItem)`
//   &::after {
//     background-image: url(${AddIcon});
//   }
// `;

export const NoOptionsText = styled.div`
  ${dropdownItemMixin}
`;
