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
          "/", // Cache homepage
          "/index.html",
          "/login.html",
          "/register.html",
          "dist/reset.css",
          "dist/composition.css",
          "dist/utilities.css",
          "dist/block.css",
          "dist/exceptions.css",
          "dist/controller.js",
          "dist/model.js",
          "dist/view.js"
        ]).catch((error) => {
          console.error("Failed to cache files:", error);
        });
      })
    );
  });