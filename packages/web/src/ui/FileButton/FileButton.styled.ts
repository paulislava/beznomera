import styled, { css, keyframes } from 'styled-components';
import { Input } from '../Input/Input.styled';

export const Container = styled.label<{ $loading?: boolean }>`
  width: 100%;
  position: relative;

  & * {
    cursor: pointer;
  }

  ${({ $loading }) =>
    $loading &&
    css`
      & * {
        cursor: default;
      }

      &::after {
        border-radius: var(--heroui-radius-medium);
        content: ' ';
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        background: linear-gradient(
          120deg,
          rgba(255, 255, 255, 0.05),
          rgba(255, 255, 255, 0.15),
          rgba(255, 255, 255, 0.05)
        );
        background-size: 200% 200%;
        animation: ${shimmer} 1.6s ease-in-out infinite;
      }
    `}
`;

const shimmer = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

export const FileInput = styled(Input)`
  & input {
    caret-color: transparent;
  }
`;

export const HiddenFileInput = styled.input`
  opacity: 0;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
`;

export const Filename = styled.div`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const FilenameContainer = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-flow: row;
  justify-content: space-between;
  gap: 5px;
`;
