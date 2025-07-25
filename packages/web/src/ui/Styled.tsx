'use client';
import styled from 'styled-components';

export const CenterContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

export const ButtonsRow = styled(CenterContainer)`
  flex-flow: row wrap;
  gap: 10px;
`;

export const ButtonsColumn = styled(CenterContainer)`
  flex-flow: column;
  gap: 10px;
`;

export const PageContainer = styled(CenterContainer)`
  max-width: 600px;
  margin: auto;
  padding: 20px;
  width: 100%;
  min-height: 100vh;
`;
