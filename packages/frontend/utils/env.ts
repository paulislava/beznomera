import { Platform } from 'react-native';

function env(name: string, defaultValue: any) {
  return process.env[`EXPO_PUBLIC_${name}`] || process.env[name] || defaultValue;
}

export default env;

export const isWeb = Platform.OS === 'web';

export const TELEGRAM_BOT_NAME = env('TELEGRAM_BOT_NAME', 'beznomera_bot');
