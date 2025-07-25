declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production';
    FRONTEND_URL: string | undefined;
    BACKEND_URL: string;
    APP_PORT: number;
    ROUTE_PREFIX: string | undefined;
    DISABLE_TELEGRAM?: string;
    CDN_URL: string;
    BACKEND_API_TOKEN: string;
  }
}
