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
};

export default withSerwist(nextConfig);
