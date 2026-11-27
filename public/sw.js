/// <reference lib="webworker" />

const STATIC_CACHE = "freshpick-static-v5";

// CMS documents and RSC payloads are always fetched from the network.
// An offline fallback is not a cached copy of a previously published page.
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
                    .filter((key) => key.startsWith("freshpick-") && key !== STATIC_CACHE)
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
        event.respondWith(fetch(request, { cache: "no-store" }).catch(() => caches.match("/offline").then(response => response || Response.error())));
        return;
    }

    // All Next.js RSC payloads, including public content, remain network-only.
    if (request.headers.get("RSC") === "1" || url.searchParams.has("_rsc")) {
        event.respondWith(fetch(request, { cache: "no-store" }));
        return;
    }

    if (url.pathname.startsWith("/_next/static/") || STATIC_ASSETS.includes(url.pathname)) {
        event.respondWith(
            caches.match(request).then((cached) => {
                const fetchPromise = fetch(request)
                    .then((response) => {
                        if (response.ok && !response.headers.get("Cache-Control")?.includes("no-store")) {
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
