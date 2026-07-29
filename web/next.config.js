/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },

  // Proxy all /api/* and static asset requests to the Express backend
  async rewrites() {
    return [
      { source: '/api/:path*',          destination: 'http://localhost:5000/api/:path*' },
      { source: '/local-songs/:path*',  destination: 'http://localhost:5000/local-songs/:path*' },
      { source: '/local-images/:path*', destination: 'http://localhost:5000/local-images/:path*' },
      { source: '/static/:path*',       destination: 'http://localhost:5000/static/:path*' },
    ];
  },

  // Serve immutable cache headers for hashed static chunks,
  // and force no-cache for HTML so browsers always re-fetch the latest chunk manifest.
  async headers() {
    return [
      {
        // Hashed JS/CSS chunks — cache forever (immutable)
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // HTML pages — never cache so the browser always gets fresh chunk URLs
        source: '/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
        ],
      },
    ];
  },

  // Suppress the "output: export" incompatibility warnings
  experimental: {},

  // Helps with Windows path separators in webpack
  webpack(config, { isServer }) {
    // Ensure webpack doesn't try to process binary files as JS
    config.module.rules.push({
      test: /\.(mp3|wav|ogg|flac|aac|m4a)$/i,
      type: 'asset/resource',
    });

    return config;
  },
};

module.exports = nextConfig;
