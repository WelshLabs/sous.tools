import { type MetadataRoute } from 'next'

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Sous Tools',
    short_name: 'sous.tools',
    description: 'The kitchen intelligence platform.',
    start_url: '/home',
    display: 'standalone',
    display_override: ['window-controls-overlay'],
    background_color: "#05070e",
    theme_color: "#3867ff",
    orientation: "any",
    categories: ["business", "food", "productivity"],
    share_target: {
      action: '/home',
      method: 'GET',
      enctype: 'multipart/form-data',
      params: {
        title: 'title',
        text: 'text',
        url: 'url',
      },
    },
    icons: [
      { src: "/icons/pwa-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/pwa-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icons/monochrome.svg", sizes: "any", type: "image/svg+xml", purpose: "monochrome" },
    ],
    shortcuts: [
      { name: "Recipes", short_name: "Recipes", url: "/recipes", icons: [{ src: "/icons/pwa-192.png", sizes: "192x192" }] },
      { name: "Kitchen display", short_name: "KDS", url: "/kds", icons: [{ src: "/icons/pwa-192.png", sizes: "192x192" }] },
    ],
  }
}

