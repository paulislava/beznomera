import { CDN_URL } from '@/constants/site';
import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  experimental: {
    cpus: 1,
    workerThreads: false
  },
  images: {
    remotePatterns: [new URL(`${CDN_URL}/**`)]
  },
  compiler: {
    styledComponents: true
  },
  turbopack: {
    root: '..',
    resolveAlias: {
      '@shared': path.join(__dirname, '../shared/src')
    }
  },
  output: 'standalone',
  env: {
    NEXT_PUBLIC_TELEGRAM_BOT_NAME: process.env.TELEGRAM_BOT_NAME,
    NEXT_PUBLIC_BACKEND_URL: process.env.BACKEND_PUBLIC_URL,
    NEXT_PUBLIC_CDN_URL: process.env.CDN_URL
  }
};

export default nextConfig;