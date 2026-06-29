import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Sous Tools Kitchen',
    short_name: 'Sous.tools',
    description: 'Interactive kitchen display system and dashboard',
    start_url: '/',
    display: 'standalone',
    background_color: '#020617', // slate-950
    theme_color: '#020617',
    orientation: 'any', // Kitchen displays could be landscape or portrait
    icons: [
      {
        src: '/icon', // Points to the dynamic icon route
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon', 
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
