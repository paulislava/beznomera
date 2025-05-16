import { CDN_URL } from "@/constants/site";
import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL(`${CDN_URL}/**`)],
  },
  compiler: {
    styledComponents: true
  },
  turbopack: {
    root: '..',
    resolveAlias: {
      '@shared': path.join(__dirname, '../shared/src'),
    },
  }
};

export default nextConfig;
