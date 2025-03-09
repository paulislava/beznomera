import { webApp } from './telegram';

export const downloadFile = (url: string, filename: string) => {
  const standartDownload = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  if (webApp) {
    try {
      webApp.downloadFile({ url, file_name: filename });
    } catch (error) {
      console.error(error);
      standartDownload();
    }
  } else {
    standartDownload();
  }
};
