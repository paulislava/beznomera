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
    console.log('initWebApp');
    init();
    alert('init');
    miniApp.mount();
    alert('mount');
    miniApp.ready();
    alert('ready');
    initData.restore();
    alert('restore');
    isTelegramWebApp = true;
    expandViewport();
    alert('expandViewport');
    await requestFullscreen();
    alert('fullscreen');
  } catch (error) {
    console.error(error);
  }
};

export { requestContactPromise };
