'use client';

import { Button } from '@/ui/Button';
import styled from 'styled-components';

const StyledContainer = styled.div`
  padding: 15px;
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const AdminButton = () => {
  return (
    <StyledContainer>
      <Button to='/panel'>Панель администратора</Button>
    </StyledContainer>
  );
};
