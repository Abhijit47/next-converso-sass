import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
        pathname: '/**',
        port: '',
      },
    ],
  },
  experimental: {
    optimizePackageImports: [
      '@clerk/nextjs',
      '@hookform/resolvers',
      '@jsmastery/utils',
      '@neondatabase/serverless',
      '@supabase/supabase-js',
      '@vapi-ai/web',
      'drizzle-orm',
      'lottie-react',
      'lucide-react',
      'react-hook-form',
      'tailwind-merge',
      'zod',
    ],
  },
};

export default nextConfig;
