'use client';

import React, { useRef } from 'react';
import { QRTemplate } from '@/components/QRTemplate';
import styled from 'styled-components';

const QRContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
`;

export function QRCode() {
  const svgRef = useRef<SVGSVGElement>(null);

  return (
    <QRContainer>
      <Title>QR-код для автомобиля</Title>
      <QRTemplate svgRef={svgRef} />
    </QRContainer>
  );
}
