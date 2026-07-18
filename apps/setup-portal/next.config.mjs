/** @type {import('next').NextConfig} */
const nextConfig = {
    // CRITICAL: standalone mode generates .next/standalone/server.js
    // which is what sous-setup-portal.service ExecStart= points to.
    // 'export' (the previous value) would disable all API routes.
    output: "standalone",
    transpilePackages: [
        "@soustools/ui", 
        "@soustools/design-system", 
        "@soustools/domain-recipes", 
        "@soustools/domain-signage",
        "@soustools/domain-inventory",
        "@soustools/domain-settings",
        '@soustools/config',
        '@soustools/api-client'
    ],
    env: {
        NEXT_PUBLIC_API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3001',
    },
    experimental: {
    },
};

export default nextConfig;
