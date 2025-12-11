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
      allowedOrigins: ['localhost:3000'], // Add your production domain in the list when known
    },
  },
  /* config options here */
};

export default nextConfig;
