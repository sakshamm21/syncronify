/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The repo also has root and server lockfiles; build from this folder.
  turbopack: { root: __dirname },
};

module.exports = nextConfig;
