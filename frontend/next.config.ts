import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Service worker viết tay ở public/sw.js: không cache file này để bản mới luôn được nạp.
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ]
  },
}

export default nextConfig
