import { View } from 'react-native';
import styled from 'styled-components/native';

export const CenterContainer = styled(View)`
  align-items: center;
  justify-content: center;
`;

export const ButtonsContainer = styled(CenterContainer)`
  flex-flow: row wrap;
  gap: 10px;
`;
