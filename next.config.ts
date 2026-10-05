import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      { source: '/recipes/:path*', destination: '/products', permanent: true },
      { source: '/meal-kits/:path*', destination: '/products', permanent: true },
      { source: '/creators/:path*', destination: '/farm-to-table', permanent: true },
      { source: '/admin/recipes/:path*', destination: '/admin/blogs', permanent: true },
    ];
  },
  images: {
    // WebP is substantially faster to encode on a cold image-optimizer
    // invocation than AVIF, which matters more for a large product catalogue.
    formats: ["image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co', pathname: '/storage/v1/object/public/**' },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
    ],
  },
  compress: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  typescript: {
    ignoreBuildErrors: process.env.SKIP_TYPE_CHECK === 'true',
  },
};

export default nextConfig;
