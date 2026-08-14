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
  assetPrefix:
    process.env.NODE_ENV === "development"
      ? ""
      : process.env.ASSET_PREFIX || "",
  allowedDevOrigins: [
    "cptr.sous.tools",
    "dev.sous.tools",
    "*.sous.tools",
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
  ],
  images: {
    remotePatterns,
  },
  // CRITICAL: standalone mode generates .next/standalone/server.js
  // which is what sous-setup-portal.service ExecStart= points to.
  // 'export' (the previous value) would disable all API routes.
  output: "standalone",
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
    "@soustools/logger",
  ],
  experimental: {},
};

export default nextConfig;
