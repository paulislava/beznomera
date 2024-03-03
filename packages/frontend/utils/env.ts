function env(name: string) {
  return process.env[`EXPO_PUBLIC_${name}`];
}

export default env;
