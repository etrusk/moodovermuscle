/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Disable chunk splitting in dev to prevent HMR timeout issues
      config.optimization = {
        ...config.optimization,
        runtimeChunk: false,
        splitChunks: false,
      }
    }
    
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        '**/node_modules/**',
        '**/.next/**',
        '**/.git/**',
        '**/.docker/**',
        '**/postgres-data/**',
        '**/coverage/**',
        '**/test-results/**',
        '**/playwright-report/**',
      ],
      poll: 1000,
      aggregateTimeout: 300,
    }
    return config
  },
  async rewrites() {
    return []
  },
  async redirects() {
    return []
  },
}

export default nextConfig
