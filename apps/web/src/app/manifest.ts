import { type MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Sous Tools',
    short_name: 'sous.tools',
    description: 'The kitchen intelligence platform.',
    start_url: '/',
    display: 'standalone',
    display_override: ['window-controls-overlay'],
    background_color: '#09090B',
    theme_color: '#09090B',
    icons: [
      {
        src: '/favicon-prod.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  }
}
