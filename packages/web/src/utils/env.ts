function env(name: string, defaultValue: string): string {
  const isClient = typeof window !== 'undefined';
  const envName = isClient ? `NEXT_PUBLIC_${name}` : name;

  console.log(envName, process.env);
  console.log(isClient);
  return (process.env[envName] as string) || defaultValue;
}

export default env;

export const isClient = typeof window !== 'undefined';

export const TELEGRAM_BOT_NAME = env('TELEGRAM_BOT_NAME', 'beznomera_bot');
