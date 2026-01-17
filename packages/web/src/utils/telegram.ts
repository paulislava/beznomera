import { AUTH_PATHNAME } from '@/helpers/constants';
import {
  init,
  miniApp,
  initData,
  expandViewport,
  requestFullscreen,
  requestContactPromise,
  viewport,
  isTMA,
  backButton
} from '@telegram-apps/sdk-react';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { TELEGRAM_BOT_NAME } from './env';

export const isTelegramWebApp = isTMA();

export const initWebApp = async (router: AppRouterInstance, pathname: string) => {
  try {
    if (!isTelegramWebApp) {
      return;
    }

    console.log('initWebApp');
    init();
    console.log('init');
    await miniApp.mount();
    console.log('mount');
    miniApp.ready();
    console.log('ready');
    initData.restore();

    if (initData.startParam) {
      const params = new URLSearchParams(initData.startParam());
      const path = params.get('path');
      if (path) {
        console.log(`Redirect to ${path}`);
        router.push(path);
      }
    }

    console.log('restore');
    expandViewport();
    console.log('expandViewport');

    backButton.mount();

    if (pathname && !['/', AUTH_PATHNAME].includes(pathname)) {
      backButton.show();
    } else {
      backButton.hide();
    }
    backButton.onClick(() => {
      router.back();
    });

    console.log('backButton');

    await viewport.mount();

    console.log(`viewport mount`);

    await requestFullscreen();
    console.log('fullscreen');
  } catch (error) {
    console.error(error);
  }
};

export const transferLinkToTelegram = (path: string) => {
  const params = new URLSearchParams({ path });
  return `https://t.me/${TELEGRAM_BOT_NAME}?startapp=${encodeURIComponent(params.toString())}`;
};

export { requestContactPromise };
