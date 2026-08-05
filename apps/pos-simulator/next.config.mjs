
/** @type {import('next').NextConfig} */
const nextConfig = {
  assetPrefix: process.env.NODE_ENV === "development" ? "" : (process.env.ASSET_PREFIX || ""),
  allowedDevOrigins: [
    "cptr.sous.tools",
    "dev.sous.tools",
    "*.sous.tools",
    "localhost",
    "127.0.0.1",
    "0.0.0.0"
  ],
  transpilePackages: [
    "@soustools/design-system",
    "@soustools/domain-pos",
    "@soustools/config",
    "@soustools/api-client",
    "@soustools/api-types",
    "@soustools/logger"
  ],
};

export default nextConfig;
