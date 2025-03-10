import { init, miniApp, initData, miniAppReady } from '@telegram-apps/sdk-react';

export let isTelegramWebApp = false;

export const initWebApp = () => {
  try {
    init();
    miniApp.mount();
    initData.restore();
    miniAppReady();
    miniApp.ready();
    isTelegramWebApp = true;
  } catch (error) {
    console.error(error);
  }
};
