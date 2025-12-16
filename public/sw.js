/// <reference lib="webworker" />

const CACHE_NAME = "freshpick-v1";
const STATIC_CACHE = "freshpick-static-v1";
const DYNAMIC_CACHE = "freshpick-dynamic-v1";

// Static assets to cache immediately
const STATIC_ASSETS = [
    "/",
    "/products",
    "/categories",
    "/deals",
    "/offline",
    "/fresh-pick.svg",
    "/placeholder.svg",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            console.log("[SW] Caching static assets");
            return cache.addAll(STATIC_ASSETS);
        })
    );
    // Activate immediately
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys
                    .filter(
                        (key) =>
                            key !== STATIC_CACHE &&
                            key !== DYNAMIC_CACHE &&
                            key !== CACHE_NAME
                    )
                    .map((key) => caches.delete(key))
            );
        })
    );
    // Take control of all pages immediately
    self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== "GET") return;

    // Skip API requests (always network)
    if (url.pathname.startsWith("/api/")) return;

    // Skip Chrome extension requests
    if (url.protocol === "chrome-extension:") return;

    // For navigation requests (pages)
    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Cache successful responses
                    if (response.ok) {
                        const responseClone = response.clone();
                        caches.open(DYNAMIC_CACHE).then((cache) => {
                            cache.put(request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Fallback to cache, then offline page
                    return caches.match(request).then((cached) => {
                        return cached || caches.match("/offline");
                    });
                })
        );
        return;
    }

    // For static assets (images, scripts, styles)
    if (
        url.pathname.match(/\.(js|css|png|jpg|jpeg|webp|avif|svg|ico|woff2?)$/)
    ) {
        event.respondWith(
            caches.match(request).then((cached) => {
                // Return cached version, fetch update in background
                const fetchPromise = fetch(request)
                    .then((response) => {
                        if (response.ok) {
                            const responseClone = response.clone();
                            caches.open(STATIC_CACHE).then((cache) => {
                                cache.put(request, responseClone);
                            });
                        }
                        return response;
                    })
                    .catch(() => cached);

                return cached || fetchPromise;
            })
        );
        return;
    }

    // Default: Network first
    event.respondWith(
        fetch(request)
            .then((response) => {
                if (response.ok) {
                    const responseClone = response.clone();
                    caches.open(DYNAMIC_CACHE).then((cache) => {
                        cache.put(request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => caches.match(request))
    );
});

// Handle push notifications (for future use)
self.addEventListener("push", (event) => {
    const data = event.data?.json() ?? {};
    const title = data.title || "Fresh Pick";
    const options = {
        body: data.body || "You have a new notification",
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-72x72.png",
        vibrate: [100, 50, 100],
        data: {
            url: data.url || "/",
        },
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const url = event.notification.data?.url || "/";

    event.waitUntil(
        self.clients.matchAll({ type: "window" }).then((clients) => {
            // Focus existing window if available
            for (const client of clients) {
                if (client.url === url && "focus" in client) {
                    return client.focus();
                }
            }
            // Open new window
            if (self.clients.openWindow) {
                return self.clients.openWindow(url);
            }
        })
    );
});
