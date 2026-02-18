import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.STATIC_EXPORT === "true" && { output: "export" }),
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
    // Rewrites are not supported with output: 'export' (static build for GitHub Pages)
    if (process.env.STATIC_EXPORT === 'true') return [];
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

export default nextConfig;
