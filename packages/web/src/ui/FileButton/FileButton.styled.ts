import styled from 'styled-components';
import { inputContainerMixin } from '@/ui/Input/Input.styled';

export const Container = styled.label<{ height?: number }>`
  ${inputContainerMixin}
  align-items: center;
  gap: 10px;
  display: grid;
  grid-template-columns: 31px 1fr;
  cursor: pointer;
  white-space: nowrap; // Чтобы текст не обрезался
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
