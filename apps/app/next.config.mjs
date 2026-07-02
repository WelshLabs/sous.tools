import { config } from "@soustools/config";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@soustools/ui", 
    "@soustools/design-system", 
    "@soustools/domain-recipes", 
    "@soustools/domain-signage",
    "@soustools/domain-inventory",
    "@soustools/domain-settings"
  ],
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async rewrites() {
    const apiBaseUrl = (config.API_BASE_URL || "http://127.0.0.1:6001").replace(
      "localhost",
      "127.0.0.1",
    );
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
        source: "/api/items/:path*",
        destination: `${apiBaseUrl}/items/:path*`,
      },
      {
        source: "/api/vendors/:path*",
        destination: `${apiBaseUrl}/vendors/:path*`,
      },
      {
        source: "/api/whiteboard/:path*",
        destination: `${apiBaseUrl}/whiteboard/:path*`,
      },
      {
        source: "/api/purchase-orders/:path*",
        destination: `${apiBaseUrl}/purchase-orders/:path*`,
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

export default withSerwist(nextConfig);
