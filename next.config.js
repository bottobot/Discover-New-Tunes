/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['i.scdn.co'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
      };
    }
    return config;
  },
  serverRuntimeConfig: {
    // Will only be available on the server side
    PROJECT_ROOT: __dirname,
  },
  experimental: {
    serverComponentsExternalPackages: ['sharp', 'tesseract.js', '@google-cloud/vision'],
  },
  transpilePackages: ['@azure/cognitiveservices-computervision', '@azure/ms-rest-js'],
};

module.exports = nextConfig;
