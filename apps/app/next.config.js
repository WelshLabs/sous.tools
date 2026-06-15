/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@soustools/ui"],
  async rewrites() {
    return [
      {
        source: "/s/:path*",
        destination: "http://localhost:5003/s/:path*",
      },
      {
        source: "/api/integrations/:path*",
        destination: "http://localhost:6000/integrations/:path*",
      },
      {
        source: "/api/signage/:path*",
        destination: "http://localhost:6000/signage/:path*",
      },
      {
        source: "/api/recipes/:path*",
        destination: "http://localhost:6000/recipes/:path*",
      },
      {
        source: "/api/pos/simulate-webhook",
        destination: "http://localhost:6000/pos-simulator/items/toggle-sold-out",
      },
      {
        source: "/api/pos/:path*",
        destination: "http://localhost:6000/pos-simulator/:path*",
      },
      {
        source: "/socket.io",
        destination: "http://localhost:6000/socket.io/",
      },
      {
        source: "/socket.io/:path*",
        destination: "http://localhost:6000/socket.io/:path*",
      },
    ];

  },
};

module.exports = nextConfig;
