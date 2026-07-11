/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:6001',
  },
  experimental: {
    instrumentationHook: true,
  },
};

export default nextConfig;
