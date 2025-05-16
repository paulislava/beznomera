function env(name: string, defaultValue: unknown) {
  const isClient = typeof window !== 'undefined';
  const envName = isClient ? `NEXT_PUBLIC_${name}` : name;
  return process.env[envName] || defaultValue;
}

export default env;

export const isClient = typeof window !== 'undefined';

export const TELEGRAM_BOT_NAME = env('TELEGRAM_BOT_NAME', 'beznomera_bot');
