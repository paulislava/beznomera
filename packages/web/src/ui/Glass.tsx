import styled from 'styled-components';

const Gradient = styled.div`
  position: absolute;
  left: 0;
  bottom: 0;
  top: 0;
  right: 0;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
`;

export const Glass = () => {
  return <Gradient />;
};
