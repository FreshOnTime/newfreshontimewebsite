"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
    useEffect(() => {
        if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

        let updateTimer: ReturnType<typeof setInterval> | undefined;
        let cancelled = false;

        const register = async () => {
            try {
                const registration = await navigator.serviceWorker.register("/sw.js");
                if (cancelled) return;

                console.log("[SW] Registered:", registration.scope);
                updateTimer = setInterval(() => {
                    registration.update().catch((error) => {
                        console.error("[SW] Update check failed:", error);
                    });
                }, 60 * 60 * 1000);
            } catch (error) {
                if (!cancelled) console.error("[SW] Registration failed:", error);
            }
        };

        const onLoad = () => {
            void register();
        };

        if (document.readyState === "complete") {
            void register();
        } else {
            window.addEventListener("load", onLoad, { once: true });
        }

        return () => {
            cancelled = true;
            window.removeEventListener("load", onLoad);
            if (updateTimer) clearInterval(updateTimer);
        };
    }, []);

    return null;
}
