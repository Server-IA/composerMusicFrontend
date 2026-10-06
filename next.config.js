/** @type {import('next').NextConfig} */
const basePath = "/composerMusic";

const nextConfig = {
  basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  experimental: {
    appDir: false,
  },
  images: {
    domains: ['localhost'],
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: basePath,
        basePath: false,
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
