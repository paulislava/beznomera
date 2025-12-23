import styled from 'styled-components';
import { Input } from '../Input/Input.styled';

export const Container = styled.label`
  width: 100%;
  position: relative;

  & * {
    cursor: pointer;
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
