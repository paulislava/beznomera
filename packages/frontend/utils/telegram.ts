export const getWebApp = () =>
  window.Telegram.WebApp.platform !== 'unknown' ? window.Telegram.WebApp : null;
