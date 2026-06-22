import { config } from "@soustools/config";

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@soustools/ui"],
  async rewrites() {
    const apiBaseUrl = (config.API_BASE_URL || "http://127.0.0.1:6001").replace('localhost', '127.0.0.1');
    return [
      {
        source: "/api/pos/simulate-webhook",
        destination: `${apiBaseUrl}/pos-simulator/items/toggle-sold-out`,
      },
      {
        source: "/api/pos/:path*",
        destination: `${apiBaseUrl}/pos-simulator/:path*`,
      },
    ];
  },
};

export default nextConfig;
