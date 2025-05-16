
import styled from 'styled-components';

export const CenterContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ButtonsRow = styled(CenterContainer)`
  flex-flow: row wrap;
  gap: 10px;
`;

export const ButtonsColumn = styled(CenterContainer)`
  flex-flow: column;
  gap: 10px;
`;
