import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: __dirname,
  },
  // Suppress preload warnings in development
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5566/api/:path*',
      },
    ];
  },
  // Suppress resource preload warnings
  experimental: {
    optimizePackageImports: [],
  },
};

// const nextConfig: NextConfig = {
//   output: "export",
//   images: {
//     unoptimized: true,
//   },
//   trailingSlash: true,
//   turbopack: {
//     root: __dirname,
//   },
// };

export default nextConfig;
