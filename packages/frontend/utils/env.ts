function env(name: string, defaultValue: any) {
  return process.env[`EXPO_PUBLIC_${name}`] || defaultValue;
}

export default env;
