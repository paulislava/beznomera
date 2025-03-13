import { init, miniApp, initData, expandViewport } from '@telegram-apps/sdk-react';

export let isTelegramWebApp = false;

export const initWebApp = () => {
  try {
    init();
    miniApp.mount();
    miniApp.ready();
    initData.restore();
    isTelegramWebApp = true;
    expandViewport();
  } catch (error) {
    console.error(error);
  }
};
