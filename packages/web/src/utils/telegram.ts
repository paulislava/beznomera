import {
  init,
  miniApp,
  initData,
  expandViewport,
  requestFullscreen,
  requestContactPromise
} from '@telegram-apps/sdk-react';

export let isTelegramWebApp = false;

export const initWebApp = async () => {
  try {
    init();
    miniApp.mount();
    miniApp.ready();
    initData.restore();
    isTelegramWebApp = true;
    expandViewport();
    await requestFullscreen();
  } catch (error) {
    console.error(error);
  }
};

export { requestContactPromise };
