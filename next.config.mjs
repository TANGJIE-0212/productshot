/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Remotion + Puppeteer compatibility
    config.externals = [...(config.externals || []), 'puppeteer', '@remotion/bundler', '@remotion/renderer'];
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['puppeteer', '@remotion/bundler', '@remotion/renderer', '@remotion/cli'],
  },
};

export default nextConfig;
