/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  webpack: (config, { isServer }) => {
    // mapbox-gl accesses browser globals (window, self) at import time.
    // On Linux/Vercel SSR build this causes webpack to crash.
    // Marking it as external on the server side prevents that.
    if (isServer) {
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : [config.externals]),
        'mapbox-gl',
      ];
    }
    // Required for mapbox-gl to work with webpack
    config.resolve.alias = {
      ...config.resolve.alias,
      'mapbox-gl': 'mapbox-gl',
    };
    return config;
  },
}

module.exports = nextConfig
