/// <reference lib="webworker" />

const STATIC_CACHE = "freshpick-static-v4";
const DYNAMIC_CACHE = "freshpick-dynamic-v4";

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
    "/about",
    "/b2b",
    "/blog",
    "/discover",
    "/farm-to-table",
    "/help",
]);

function isCacheablePublicPage(url) {
    return (
        PUBLIC_PAGE_PATHS.has(url.pathname) ||
        url.pathname.startsWith("/categories/") ||
        url.pathname.startsWith("/products/") ||
        url.pathname.startsWith("/blog/")
    );
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

        return cached || network;
    });
}

const STATIC_ASSETS = [
    "/offline",
    "/fresh-pick.svg",
    "/placeholder.svg",
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys
                    .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
                    .map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);

    if (request.method !== "GET") return;
    if (url.origin !== self.location.origin) return;
    if (url.pathname.startsWith("/api/")) return;
    if (url.protocol === "chrome-extension:") return;

    if (request.mode === "navigate") {
        if (isCacheablePublicPage(url)) {
            event.respondWith(
                staleWhileRevalidate(request).catch(() => caches.match("/offline"))
            );
            return;
        }

        event.respondWith(fetch(request).catch(() => caches.match("/offline")));
        return;
    }

    // Next.js client-side navigation requests RSC payloads. Only explicitly
    // public routes are allowed into the dynamic cache. Private/account RSC
    // responses must always remain network-only.
    if (request.headers.get("RSC") === "1") {
        if (isCacheablePublicPage(url)) {
            event.respondWith(staleWhileRevalidate(request));
        }
        return;
    }

    if (url.pathname.match(/\.(js|css|png|jpg|jpeg|webp|avif|svg|ico|woff2?)$/)) {
        event.respondWith(
            caches.match(request).then((cached) => {
                const fetchPromise = fetch(request)
                    .then((response) => {
                        if (response.ok) {
                            caches.open(STATIC_CACHE).then((cache) => {
                                cache.put(request, response.clone());
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

    // Everything else stays network-only. This intentionally avoids caching
    // account-specific framework payloads, auth pages, and other GET responses
    // that are not explicitly classified as public content.
});

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

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const targetUrl = new URL(event.notification.data?.url || "/", self.location.origin).href;

    event.waitUntil(
        self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
            for (const client of clients) {
                if (client.url === targetUrl && "focus" in client) {
                    return client.focus();
                }
            }
            if (self.clients.openWindow) {
                return self.clients.openWindow(targetUrl);
            }
        })
    );
});
