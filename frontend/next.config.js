/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // eth-crypto requires these Node.js polyfills in browser
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer'),
    };
    // eth-crypto uses a CommonJS top-level return; exclude from SSR bundle
    if (isServer) {
      config.externals = [...(config.externals ?? []), 'eth-crypto'];
    }
    return config;
  },
};

module.exports = nextConfig;
