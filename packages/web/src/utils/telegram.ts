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

export const isTelegramWebApp = isTMA();

export const initWebApp = async () => {
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
      console.log('BACK PAGE!');
    });

    await viewport.mount();

    console.log(`viewport mount`);

    await requestFullscreen();
    console.log('fullscreen');
  } catch (error) {
    console.error(error);
  }
};

export { requestContactPromise };
