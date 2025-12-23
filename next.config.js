/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Use server-side rendering (SSR) instead of static export
  // This allows dynamic pages to work
  // output: 'export', // Commented out - using SSR instead
  
  // Image configuration
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;