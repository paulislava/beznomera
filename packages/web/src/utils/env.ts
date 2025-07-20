function env(name: string, defaultValue: string): string {
  const isClient = typeof window !== 'undefined';
  const envName = isClient ? `NEXT_PUBLIC_${name}` : name;

  const value = process.env[envName];

  if (!value && !defaultValue) {
    console.warn(`Environment variable ${envName} is not set and no default value provided`);
  }

  return (value as string) || defaultValue;
}

export default env;

export const isClient = typeof window !== 'undefined';

export const TELEGRAM_BOT_NAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || 'beznomera_bot';
