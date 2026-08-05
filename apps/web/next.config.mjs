import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development" || process.env.NODE_ENV === "staging",
});

const remotePatterns = [];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (supabaseUrl) {
  try {
    const url = new URL(supabaseUrl);
    remotePatterns.push({
      protocol: url.protocol.replace(":", ""),
      hostname: url.hostname,
      port: url.port || "",
      pathname: "/**",
    });
  } catch (e) {
    // ignore
  }
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
if (apiUrl) {
  try {
    const url = new URL(apiUrl);
    remotePatterns.push({
      protocol: url.protocol.replace(":", ""),
      hostname: url.hostname,
      port: url.port || "",
      pathname: "/**",
    });
  } catch (e) {
    // ignore
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["dev.sous.tools", "localhost"],
  images: {
    remotePatterns,
  },
  transpilePackages: [
    "@soustools/design-system",
    "@soustools/domain-inventory",
    "@soustools/domain-pos",
    "@soustools/domain-recipes",
    "@soustools/domain-settings",
    "@soustools/domain-signage",
    "@soustools/config",
    "@soustools/api-client",
    "@soustools/api-types",
    "@soustools/logger"
  ],
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default withSerwist(nextConfig);
