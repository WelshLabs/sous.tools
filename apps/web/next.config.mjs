import { config } from "@soustools/config";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["dev.sous.tools", "localhost"],
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
      {
        source: "/api/:path*",
        destination: `${apiBaseUrl}/:path*`,
      },
    ];
  },
};

export default withSerwist(nextConfig);
