import { init, miniApp, miniAppReady } from '@telegram-apps/sdk-react';

export let isTelegramWebApp = false;

export const initWebApp = () => {
  try {
    init();
    miniAppReady();
    miniApp.ready();
    isTelegramWebApp = true;
  } catch (error) {
    console.error(error);
  }
};
