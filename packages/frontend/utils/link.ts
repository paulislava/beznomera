import { Linking } from 'react-native';

/**
 * Открывает ссылку в браузере или нативном приложении
 * @param url - URL для открытия
 * @returns Promise, который резолвится с true если ссылка была открыта успешно
 */
export const openLink = async (url: string): Promise<boolean> => {
  try {
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
      return true;
    }

    console.warn(`Не удалось открыть ссылку: ${url}`);
    return false;
  } catch (error) {
    console.error('Ошибка при открытии ссылки:', error);
    return false;
  }
};
