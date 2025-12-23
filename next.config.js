/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Enable static export
  output: 'export',
  
  // Image configuration - add GitHub raw content domain
  images: {
    domains: [
      'explorer.silverbitcoin.org',
      'raw.githubusercontent.com'  // Added this domain
    ],
    unoptimized: true, // Required for static export
  },
};

module.exports = nextConfig;