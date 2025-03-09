import { downloadFile as downloadFileTelegram } from '@telegram-apps/sdk-react';

export const downloadFile = (url: string, filename: string) => {
  const standartDownload = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  if (downloadFileTelegram.isAvailable()) {
    alert('Функция доступна!');
    try {
      downloadFileTelegram(url, filename);
    } catch (error) {
      console.error(error);
      standartDownload();
    }
  } else {
    alert('Функция недоступна!');
    standartDownload();
  }
};
