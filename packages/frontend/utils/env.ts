function env(name: string, defaultValue: any) {
  return process.env[`EXPO_PUBLIC_${name}`] || process.env[name] || defaultValue;
}

export default env;
