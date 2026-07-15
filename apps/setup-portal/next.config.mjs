/** @type {import('next').NextConfig} */
const nextConfig = {
  // CRITICAL: standalone mode generates .next/standalone/server.js
  // which is what sous-setup-portal.service ExecStart= points to.
  // 'export' (the previous value) would disable all API routes.
  output: "standalone",
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:6001',
  },
  experimental: {
    instrumentationHook: true,
  },
};

export default nextConfig;
