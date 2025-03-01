import { LinearGradient } from 'expo-linear-gradient';
import styled from 'styled-components/native';

const Gradient = styled(LinearGradient)`
  position: absolute;
  left: 0;
  bottom: 0;
  top: 0;
  right: 0;
`;

export const Glass = () => {
  return (
    <Gradient
      colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    />
  );
};
