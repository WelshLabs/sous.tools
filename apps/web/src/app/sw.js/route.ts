import { NextResponse } from "next/server";

export async function GET() {
  const selfDestroyingSw = `
    self.addEventListener('install', function() {
      self.skipWaiting();
    });
    self.addEventListener('activate', function(event) {
      event.waitUntil(
        self.registration.unregister().then(function() {
          return self.clients.matchAll();
        }).then(function(clients) {
          clients.forEach(function(client) {
            client.navigate(client.url);
          });
        })
      );
    });
  `;

  return new NextResponse(selfDestroyingSw, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    },
  });
}
