/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@soustools/ui"],
  async rewrites() {
    return [
      {
        source: "/api/integrations/:path*",
        destination: "http://localhost:6000/integrations/:path*",
      },
      {
        source: "/api/signage/:path*",
        destination: "http://localhost:6000/signage/:path*",
      },
      {
        source: "/api/pos/simulate-webhook",
        destination: "http://localhost:6000/pos-simulator/items/toggle-sold-out",
      },
      {
        source: "/api/pos/:path*",
        destination: "http://localhost:6000/pos-simulator/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
