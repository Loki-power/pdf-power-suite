/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        https: false,
        http: false,
        stream: false,
        crypto: false,
        buffer: false,
        url: false,
      };
    }
    return config;
  },
  serverExternalPackages: ['sharp'],
};

export default nextConfig;
