self.addEventListener("install", (event) => {
    console.log("Service Worker Installed");
});
self.addEventListener("fetch", (event) => {
    event.respondWith(fetch(event.request));
});

self.addEventListener("install", (event) => {
    event.waitUntil(
      caches.open("app-cache").then((cache) => {
        return cache.addAll([
          "/", // Cache the main page
          "/index.html",
          "/styles.css",
          "/script.js",
          "/favicon.ico",
          // Add more assets your app needs
        ]);
      })
    );
  });