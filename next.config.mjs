/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Production domain configuration
  async rewrites() {
    return []
  },
  async redirects() {
    return []
  },
}

export default nextConfig
