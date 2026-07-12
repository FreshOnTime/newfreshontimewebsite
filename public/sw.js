/// <reference lib="webworker" />

const CACHE_NAME = "freshpick-v3";
const STATIC_CACHE = "freshpick-static-v3";
const DYNAMIC_CACHE = "freshpick-dynamic-v3";

// These routes are public catalogue/marketing content. Account, bag, checkout,
// order, dashboard, and admin pages are intentionally excluded so no
// user-specific response can be stored by the browser.
const PUBLIC_PAGE_PATHS = new Set([
    "/",
    "/products",
    "/search",
    "/meals",
    "/homemade",
    "/categories",
    "/deals",
    "/subscriptions",
    "/meal-kits",
    "/about",
    "/b2b",
]);

function isCacheablePublicPage(url) {
    return PUBLIC_PAGE_PATHS.has(url.pathname) || url.pathname.startsWith("/categories/");
}

function staleWhileRevalidate(request) {
    return caches.open(DYNAMIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request)
            .then((response) => {
                if (response.ok) cache.put(request, response.clone());
                return response;
            })
            .catch(() => cached);

        // A cached response makes repeat navigation immediate while the latest
        // public content refreshes quietly in the background.
        return cached || network;
    });
}

// Static assets to cache immediately
const STATIC_ASSETS = [
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

    // Cache only explicitly public page HTML and Next RSC payloads. This is the
    // path used by client-side navigation, so it removes the network wait after
    // a visitor has opened a catalogue page once.
    if (request.mode === "navigate") {
        if (isCacheablePublicPage(url)) {
            event.respondWith(
                staleWhileRevalidate(request).catch(() => caches.match("/offline"))
            );
            return;
        }
        event.respondWith(
            fetch(request)
                .catch(() => caches.match("/offline"))
        );
        return;
    }

    if (request.headers.get("RSC") === "1" && isCacheablePublicPage(url)) {
        event.respondWith(staleWhileRevalidate(request));
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
