import { getWebApp } from './telegram';

export const downloadFile = (url: string, filename: string) => {
  const standartDownload = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    alert('standart download file');
  };

  const webApp = getWebApp();

  if (webApp) {
    try {
      webApp.downloadFile({ url, file_name: filename });
      alert('download file!');
    } catch (error) {
      console.error(error);
      standartDownload();
    }
  } else {
    standartDownload();
  }
};
