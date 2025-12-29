import { CDN_URL } from '@/constants/site';
import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  experimental: {
    cpus: 1,
    workerThreads: false,
    authInterrupts: true,
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js'
        }
      }
    }
  },

  webpack(config) {
    const fileLoaderRule = config.module.rules.find((rule: any) => rule.test?.test?.('.svg'));

    config.module.rules.push(
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/
      },
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [/url/] },
        use: ['@svgr/webpack']
      }
    );
    fileLoaderRule.exclude = /\.svg$/i;

    return config;
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
  },
  rewrites: async () => {
    return {
      afterFiles: [
        {
          source: '/api/:path*',
          destination: `${process.env.BACKEND_URL}/:path*`
        }
      ]
    };
  }
};

export default nextConfig;
