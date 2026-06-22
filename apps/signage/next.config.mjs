import { config } from "@soustools/config";

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@soustools/ui"],
  async rewrites() {
    const apiBaseUrl = (config.API_BASE_URL || "http://127.0.0.1:6001").replace('localhost', '127.0.0.1');
    return [
      {
        source: "/api/signage/:path*",
        destination: `${apiBaseUrl}/signage/:path*`,
      },
      {
        source: "/api/pos/:path*",
        destination: `${apiBaseUrl}/pos-simulator/:path*`,
      },
      {
        source: "/socket.io",
        destination: `${apiBaseUrl}/socket.io/`,
      },
      {
        source: "/socket.io/:path*",
        destination: `${apiBaseUrl}/socket.io/:path*`,
      },
    ];
  },
};

export default nextConfig;
