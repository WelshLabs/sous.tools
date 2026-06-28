import { config } from "@soustools/config";

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@soustools/ui"],
  async rewrites() {
    const apiBaseUrl = (config.API_BASE_URL || "http://127.0.0.1:6001").replace('localhost', '127.0.0.1');
    return [
      {
        source: "/s/:path*",
        destination: "http://localhost:5003/s/:path*",
      },
      {
        source: "/api/integrations/:path*",
        destination: `${apiBaseUrl}/integrations/:path*`,
      },
      {
        source: "/api/ingestion/:path*",
        destination: `${apiBaseUrl}/ingestion/:path*`,
      },
      {
        source: "/api/signage/:path*",
        destination: `${apiBaseUrl}/signage/:path*`,
      },
      {
        source: "/api/recipes/:path*",
        destination: `${apiBaseUrl}/recipes/:path*`,
      },
      {
        source: "/api/recipes-meta/:path*",
        destination: `${apiBaseUrl}/recipes-meta/:path*`,
      },
      {
        source: "/api/pos/simulate-webhook",
        destination: `${apiBaseUrl}/pos-simulator/items/toggle-sold-out`,
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
