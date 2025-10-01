import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "www.freshdirect.com",
      },
      // Allow common external image CDNs used in content (Unsplash, Imgix, etc.)
      {
        protocol: 'https',
        hostname: '**.images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // Google user content (profile images, uploads, etc.)
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      // Additional common CDNs
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: process.env.SKIP_TYPE_CHECK === 'true',
  },
  eslint: {
    ignoreDuringBuilds: process.env.SKIP_TYPE_CHECK === 'true',
  },
};

export default nextConfig;
