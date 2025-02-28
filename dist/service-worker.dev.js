"use strict";

self.addEventListener("install", function (event) {
  console.log("Service Worker Installed");
});
self.addEventListener("fetch", function (event) {
  event.respondWith(fetch(event.request));
});
self.addEventListener("install", function (event) {
  event.waitUntil(caches.open("app-cache").then(function (cache) {
    return cache.addAll(["/", // Cache homepage
    "/index.html", "/login.html", "/register.html", "dist/reset.css", "dist/composition.css", "dist/utilities.css", "dist/block.css", "dist/exceptions.css", "dist/controller.js", "dist/model.js", "dist/view.js"])["catch"](function (error) {
      console.error("Failed to cache files:", error);
    });
  }));
});