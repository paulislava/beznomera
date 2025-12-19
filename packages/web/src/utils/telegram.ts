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
import { NextRouter } from 'next/router';

export const isTelegramWebApp = isTMA();

export const initWebApp = async (router: NextRouter) => {
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
    console.log('restore');
    expandViewport();
    console.log('expandViewport');

    backButton.mount();
    backButton.show();
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

export { requestContactPromise };
