/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },

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
