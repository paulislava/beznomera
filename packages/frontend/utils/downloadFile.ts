import { downloadFile as downloadFileTelegram } from '@telegram-apps/sdk';

export const downloadFile = (url: string, filename: string) => {
  const standartDownload = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    alert('standart download file');
  };

  if (downloadFileTelegram.isAvailable()) {
    try {
      downloadFileTelegram(url, filename);
      alert('download file!');
    } catch (error) {
      console.error(error);
      standartDownload();
    }
  } else {
    standartDownload();
  }
};
