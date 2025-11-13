const CACHE_NAME = "smartfit-cache-v1";

const ASSETS = [ // Archivos a cachear
  "./",
  "./index.html",
  "./manifest.json",
  "./styles.css",
  "./app.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// Evento 'install': se ejecuta cuando el Service Worker se instala por primera vez.
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS); // Agrega todos los archivos a la caché.
    })
  );
  self.skipWaiting(); // Fuerza la activación del nuevo Service Worker.
});

// Evento 'activate': se ejecuta cuando el Service Worker se activa.
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME) // Filtra las cachés antiguas.
          .map(key => caches.delete(key))    // Elimina las cachés antiguas.
      )
    )
  );
  self.clients.claim(); // Reclama el control de las páginas abiertas.
});

// Evento 'fetch': se ejecuta para cada petición de red.
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Si existe en caché, devuelve la respuesta cacheada.
      if (cachedResponse) return cachedResponse;

      // Si no existe, busca en la red.
      return fetch(event.request).then(networkResponse => {
        // Guarda la nueva respuesta en cache.
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse; // Devuelve la respuesta de la red.
        });
      });
    })
  );
});
