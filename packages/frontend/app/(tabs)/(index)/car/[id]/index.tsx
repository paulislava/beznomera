import React, { useMemo } from 'react';
import { useGlobalSearchParams, Stack, Link, router } from 'expo-router';
import { View, ImageStyle, StyleProp, ImageSourcePropType, Pressable } from 'react-native';
import { CarImage } from '@/components/CarImage/CarImage';
import { useAPI } from '@/utils/api-service';
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
import { Button } from '@/ui/Button';
import { FontAwesome } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import useNeedAuth from '@/hooks/useNeedAuth';
import { CenterContainer, ButtonsContainer } from '@/ui/Styled';
import { requestContactPromise } from '@telegram-apps/sdk-react';
import { isTelegramWebApp } from '@/utils/telegram';

const StyledCarImage = styled(CarImage)`
  margin: 40px 0;
  width: 100%;
  height: auto;
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

const StyledView = styled(View)`
  width: 100%;
`;

const QRButtonContainer = styled(CenterContainer)`
  margin: 20px 0;
`;

const DeleteButtonContainer = styled(CenterContainer)`
  margin-top: 20px;
`;

const brandLogoStyle: StyleProp<ImageStyle> = { resizeMode: 'contain' };

export default function CarFullInfoScreen() {
  useNeedAuth();

  const colorScheme = useColorScheme();

  const { id } = useGlobalSearchParams<{ id: string }>();
  const getInfo = useCallback(() => carService.fullInfo(Number(id)), [id]);

  const info = useAPI(getInfo);

  const brandLogoSource: ImageSourcePropType = useMemo(
    () => ({ uri: info?.brand?.logoUrl ?? undefined }),
    [info]
  );

  const handleAddOwner = useCallback(async () => {
    const contact = await requestContactPromise();

    console.log(contact);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!confirm('Вы уверены, что хотите удалить этот автомобиль?')) {
      return;
    }

    try {
      await carService.delete(Number(id));
      router.replace('/');
    } catch (error) {
      console.error('Failed to delete car:', error);
      alert('Не удалось удалить автомобиль');
    }
  }, [id]);

  return (
    <PageView fullHeight>
      <Stack.Screen
        options={{
          title: `${info?.no ?? 'Мое авто'}: информация`,
          headerRight: () => (
            <Link href={`/car/${id}/edit`} asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name='edit'
                    size={25}
                    color={Colors[colorScheme ?? 'light'].text}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          )
        }}
      />
      <Head>
        <title>{info?.no ?? 'Мое авто'}: информация</title>
      </Head>
      {info && (
        <>
          {info.brand && (
            <StyledModelRow>
              <CarModelBrand>{info.brandRaw || info.brand.title}</CarModelBrand>
              {info.brand.logoUrl && <BrandLogo style={brandLogoStyle} source={brandLogoSource} />}
              <CarModel>{info.model}</CarModel>
            </StyledModelRow>
          )}

          {info.no && <CarNumber>{info.no}</CarNumber>}

          {info.imageUrl ? (
            <CarExternalImage
              $aspectRatio={info.imageRatio}
              resizeMode='contain'
              source={{ uri: info.imageUrl }}
            />
          ) : (
            <StyledCarImage color={info.color?.value ?? info.rawColor} />
          )}

          <StyledView>
            <StatsContainer>
              <StatsItem>Позвали: {pluralize(info.callsCount, ['раз', 'раза', 'раз'])}</StatsItem>
              <StatsItem>
                {pluralize(info.messagesCount, ['сообщение', 'сообщения', 'сообщений'])} в{' '}
                {pluralize(info.chatsCount, ['чате', 'чатах', 'чатах'])}
              </StatsItem>
            </StatsContainer>

            <QRButtonContainer>
              <Link href={`/car/${id}/qr`} asChild>
                <Button>Получить QR-код</Button>
              </Link>
            </QRButtonContainer>

            <InfoContainer>
              {info.version && <InfoText>Версия: {info.version}</InfoText>}
              {info.year && <InfoText>Год выпуска: {info.year}</InfoText>}
              {info.color && <InfoText>Цвет: {info.color.title}</InfoText>}
            </InfoContainer>
          </StyledView>

          <ButtonsContainer>
            <Link href={`/car/${id}/edit`} asChild>
              <Button>Редактировать</Button>
            </Link>
            {isTelegramWebApp && (
              <Button view='secondary' onClick={handleAddOwner}>
                Добавить владельца
              </Button>
            )}
          </ButtonsContainer>
          <DeleteButtonContainer>
            <Button view='danger' onClick={handleDelete}>
              Удалить
            </Button>
          </DeleteButtonContainer>
        </>
      )}
    </PageView>
  );
}
