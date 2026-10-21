// sw.js
// Service Worker para funcionamiento sin conexion (cache-first) e instalacion como PWA.
// Cumple con docs/01 RF-10 y docs/02 §1 (D-03) y §8.

const VERSION_CACHE = 'rutina-fuerza-v7';

const ARCHIVOS_CACHE = [
  './',
  './index.html',
  './css/estilos.css',
  './js/app.js',
  './js/rutina.js',
  './js/logica.js',
  './js/registro.js',
  './js/figura.js',
  './js/poses.js',
  './js/agarre.js',
  './js/temporizador.js',
  './manifest.webmanifest',
  './iconos/icono.svg',
  './iconos/icono-192.png',
  './iconos/icono-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION_CACHE).then((cache) => {
      return cache.addAll(ARCHIVOS_CACHE);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== VERSION_CACHE).map((key) => caches.delete(key))
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Solo interceptar peticiones GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((respuestaEnCache) => {
      if (respuestaEnCache) {
        return respuestaEnCache;
      }
      return fetch(event.request).then((respuestaRed) => {
        // Si la respuesta es valida, clonarla y guardarla en cache dinamica
        if (respuestaRed && respuestaRed.status === 200 && respuestaRed.type === 'basic') {
          const clon = respuestaRed.clone();
          caches.open(VERSION_CACHE).then((cache) => {
            cache.put(event.request, clon);
          });
        }
        return respuestaRed;
      }).catch(() => {
        // Si no hay red y no esta en cache, devolver index.html si es navegacion
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
