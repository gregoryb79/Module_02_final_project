"use strict";

self.addEventListener("install", function (event) {
  console.log("Service Worker Installed");
});
self.addEventListener("fetch", function (event) {
  event.respondWith(fetch(event.request));
});
self.addEventListener("install", function (event) {
  event.waitUntil(caches.open("app-cache").then(function (cache) {
    return cache.addAll(["/", // Cache the main page
    "/index.html", "/styles.css", "/script.js", "/favicon.ico" // Add more assets your app needs
    ]);
  }));
});