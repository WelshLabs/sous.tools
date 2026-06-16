/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@soustools/ui"],
  async rewrites() {
    return [
      {
        source: "/api/signage/:path*",
        destination: "http://localhost:6000/signage/:path*",
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
