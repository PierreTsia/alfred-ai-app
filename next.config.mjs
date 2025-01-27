import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin(
  './core/config/i18n/request.ts'  // Updated path
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // This is needed for react-pdf to work
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: 'images.clerk.dev',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
