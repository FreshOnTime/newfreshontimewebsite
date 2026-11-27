import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable the output expected by the Dockerfile without changing Netlify's build mode.
  output: process.env.FRESHPICK_STANDALONE === 'true' ? 'standalone' : undefined,
  poweredByHeader: false,
  // Netlify's pinned Next.js adapter omits dot-prefixed app directories from its
  // serverless bundle. Keep both standard OAuth URLs publicly accessible but serve
  // them from a normal API route (which is reliably included in the function).
  async rewrites() {
    return [
      { source: '/.well-known/oauth-protected-resource', destination: '/api/mcp/oauth-resource-metadata' },
      { source: '/.well-known/oauth-protected-resource/api/mcp', destination: '/api/mcp/oauth-resource-metadata' },
    ];
  },
  async redirects() {
    return [
      { source: '/products/:path*', destination: '/makers', permanent: false },
      { source: '/categories/:path*', destination: '/makers', permanent: false },
      { source: '/collections/:path*', destination: '/makers', permanent: false },
      { source: '/search', destination: '/makers', permanent: false },
      { source: '/diaspora', destination: '/makers', permanent: false },
      { source: '/deals', destination: '/makers', permanent: false },
      { source: '/subscriptions', destination: '/makers', permanent: false },
      { source: '/bags/:path*', destination: '/makers', permanent: false },
      { source: '/checkout', destination: '/makers', permanent: false },
      { source: '/for-you', destination: '/makers', permanent: false },
      { source: '/farm-to-table', destination: '/makers', permanent: false },
      { source: '/creators/:path*', destination: '/makers', permanent: false },
      { source: '/recipes/:path*', destination: '/makers', permanent: false },
      { source: '/meal-kits/:path*', destination: '/makers', permanent: false },
      { source: '/homemade', destination: '/makers', permanent: false },
      { source: '/meals', destination: '/makers?kind=Prepared%20food', permanent: false },
      { source: '/b2b', destination: '/join', permanent: false },
      { source: '/supply', destination: '/join', permanent: false },
      { source: '/auth/signup/supplier', destination: '/join', permanent: false },
      { source: '/auth/supplier-signup', destination: '/join', permanent: false },
      { source: '/landing', destination: '/', permanent: false },
      { source: '/about-us', destination: '/about', permanent: false },
      { source: '/how-it-works/suppliers', destination: '/how-it-works', permanent: false },
      { source: '/how-it-works/customers', destination: '/how-it-works', permanent: false },
      { source: '/wishlist', destination: '/saved', permanent: false },
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
