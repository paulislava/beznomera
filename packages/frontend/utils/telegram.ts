import { init } from '@telegram-apps/sdk-react';

export let isTelegramWebApp = false;

export const initWebApp = () => {
  try {
    init();
    isTelegramWebApp = true;
  } catch (error) {
    console.error(error);
  }
};
