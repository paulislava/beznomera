import {
  init,
  miniApp,
  initData,
  expandViewport,
  requestFullscreen,
  requestContactPromise,
  viewport
} from '@telegram-apps/sdk-react';

export let isTelegramWebApp = false;

export const initWebApp = async () => {
  try {
    console.log('initWebApp');
    init();
    console.log('init');
    await miniApp.mount();
    console.log('mount');
    miniApp.ready();
    console.log('ready');
    initData.restore();
    console.log('restore');
    isTelegramWebApp = true;
    expandViewport();
    console.log('expandViewport');

    await viewport.mount();

    await requestFullscreen();
    console.log('fullscreen');
  } catch (error) {
    console.error(error);
  }
};

export { requestContactPromise };
