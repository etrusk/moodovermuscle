/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {},
  // Production domain configuration
  async rewrites() {
    return []
  },
  async redirects() {
    return []
  },
}

export default nextConfig
