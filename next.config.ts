import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [],
    // Allow data URIs for base64 images
    dangerouslyAllowSVG: true,
    unoptimized: false,
  },
  serverExternalPackages: ['@prisma/client', 'prisma'],
  experimental: {
    serverActions: {
      // Allow localhost for development and production domains
      allowedOrigins: process.env.ALLOWED_ORIGINS 
        ? process.env.ALLOWED_ORIGINS.split(',')
        : ['localhost:3000'],
    },
  },
  /* config options here */
};

export default nextConfig;
