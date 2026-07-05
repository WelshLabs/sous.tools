import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  const env = process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV;
  
  let iconPath = "/favicon-prod.svg";
  if (env === "development") {
    iconPath = "/favicon-dev.svg";
  } else if (env === "staging") {
    iconPath = "/favicon-staging.svg";
  }

  return {
    name: 'Sous Tools Kitchen',
    short_name: 'sous.tools',
    description: 'Interactive kitchen display system and dashboard',
    start_url: '/',
    display: 'standalone',
    display_override: ['window-controls-overlay', 'minimal-ui'],
    background_color: '#020617', // zinc-950
    theme_color: '#020617',
    orientation: 'any', // Kitchen displays could be landscape or portrait
    icons: [
      {
        src: iconPath,
        sizes: '512x512',
        type: 'image/svg+xml',
      },
      {
        src: iconPath,
        sizes: '192x192',
        type: 'image/svg+xml',
      },
    ],
  };
}
