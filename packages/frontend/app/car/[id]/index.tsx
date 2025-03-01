import React, { useMemo } from 'react';
import { useLocalSearchParams, Stack } from 'expo-router';
import { View, ScrollView, ImageSourcePropType, ImageStyle, StyleProp } from 'react-native';
import { CarImage } from '../../../components/CarImage/CarImage';
import { useAPI } from '@/utils/api';
import { carService } from '@/services';
import { PageView } from '@/components/Themed';
import Head from 'expo-router/head';
import { useCallback } from 'react';
import { Text } from '@/components/Themed';
import styled from 'styled-components/native';
import { BrandLogo, CarModel, CarModelBrand, ModelRow } from '@/components/CarDetails';
import { CarNumber } from '@/components/CarDetails';
import { CarExternalImage } from '@/components/CarDetails';
import { pluralize } from '@/utils/strings';

const StyledCarImage = styled(CarImage)`
  width: 100%;
  height: 100%;
`;

const InfoContainer = styled(View)`
  padding: 16px;
`;

const InfoText = styled(Text)`
  font-size: 16px;
  margin-bottom: 8px;
`;

const StatsContainer = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  background-color: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
`;

const StatsItem = styled(Text)`
  font-size: 14px;
  color: #666;
`;

const StyledModelRow = styled(ModelRow)`
  margin-top: 20px;
`;

const brandLogoStyle: StyleProp<ImageStyle> = { resizeMode: 'contain' };

export default function CarFullInfoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const getInfo = useCallback(() => carService.fullInfo(Number(id)), [id]);
  const info = useAPI(getInfo);

  const brandLogoSource: ImageSourcePropType = useMemo(
    () => ({ uri: info?.brand?.logoUrl ?? undefined }),
    [info]
  );

  return (
    <PageView fullHeight>
      <Stack.Screen
        options={{
          title: `${info?.no ?? 'Мое авто'}: информация`
        }}
      />
      <Head>
        <title>{info?.no ?? 'Мое авто'}: информация</title>
      </Head>
      {info && (
        <ScrollView>
          {info.brand && (
            <StyledModelRow $center>
              <CarModelBrand>{info.brandRaw || info.brand.title}</CarModelBrand>
              {info.brand.logoUrl && <BrandLogo style={brandLogoStyle} source={brandLogoSource} />}
              <CarModel>{info.model}</CarModel>
            </StyledModelRow>
          )}

          {info.no && <CarNumber>{info.no}</CarNumber>}

          {/* {info.no && <CarNumber>{info.no}</CarNumber>} */}
          {info.imageUrl ? (
            <CarExternalImage
              $aspectRatio={info.imageRatio}
              resizeMode='contain'
              source={{ uri: info.imageUrl }}
            />
          ) : (
            <StyledCarImage color={info.color?.value ?? info.rawColor} />
          )}

          <StatsContainer>
            <StatsItem>Позвали: {pluralize(info.callsCount, ['раз', 'раза', 'раз'])}</StatsItem>
            <StatsItem>
              {pluralize(info.messagesCount, ['сообщение', 'сообщения', 'сообщений'])} в{' '}
              {pluralize(info.chatsCount, ['чате', 'чатах', 'чатах'])}
            </StatsItem>
          </StatsContainer>

          <InfoContainer>
            {info.version && <InfoText>Версия: {info.version}</InfoText>}
            {info.year && <InfoText>Год выпуска: {info.year}</InfoText>}
            {info.color && <InfoText>Цвет: {info.color.title}</InfoText>}
          </InfoContainer>
        </ScrollView>
      )}
    </PageView>
  );
}
