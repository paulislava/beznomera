import React, { useEffect } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from '@/components/useColorScheme';
import { SITE_TITLE } from '@/constants/site';
import styled from 'styled-components';
import Svg, { Defs, LinearGradient, Stop } from 'react-native-svg';
import { Helmet, HelmetProvider } from 'react-helmet-async';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)'
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

const Container = styled.div`
  background-size: 100vh 100%;
  flex: 1 1 0%;
  display: flex;
  color: white;
`;

const StyledSvg = styled(Svg)`
  visibility: hidden;
`;

const helmetContext = {};

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <HelmetProvider context={helmetContext}>
      <Helmet>
        <script
          type='text/javascript'
          async
          defer
        >{`(function(m,e,t,r,i,k,a){m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments) };
          m[i].l = 1 * new Date();
          for(var j = 0; j<document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
   k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
        (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

        ym(99937060, "init", {
          clickmap:true,
        trackLinks:true,
        accurateTrackBounce:true,
        webvisor:true
   });`}</script>
      </Helmet>
      <Container>
        <StyledSvg width={0} height={0}>
          <Defs>
            <LinearGradient
              id='paint0_linear_2005_86'
              x1='180'
              y1='0'
              x2='180'
              y2='640'
              gradientUnits='userSpaceOnUse'
            >
              <Stop stopColor='#090633' />
              <Stop offset='0.451264' stopColor='#05031C' />
              <Stop offset='1' />
            </LinearGradient>
          </Defs>
        </StyledSvg>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ title: SITE_TITLE }}>
            <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
            <Stack.Screen name='modal' options={{ presentation: 'modal' }} />
            <Stack.Screen name='login' options={{ headerShown: false, title: 'Вход' }} />

            <Stack.Screen
              name='g/[code]'
              options={{ headerShown: false, title: 'Позвать водителя' }}
            />
          </Stack>
        </ThemeProvider>
      </Container>
    </HelmetProvider>
  );
}
