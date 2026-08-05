
/** @type {import('next').NextConfig} */
const nextConfig = {
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
