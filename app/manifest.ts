import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Fresh Pick - Premium Grocery Delivery",
        short_name: "Fresh Pick",
        description: "Premium artisanal groceries, sourced from the world's finest growers, delivered to your doorstep in Colombo.",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#059669",
        orientation: "portrait-primary",
        categories: ["food", "shopping", "lifestyle"],
        icons: [
            {
                src: "/icons/icon-72x72.png",
                sizes: "72x72",
                type: "image/png",
                purpose: "maskable",
            },
            {
                src: "/icons/icon-96x96.png",
                sizes: "96x96",
                type: "image/png",
                purpose: "maskable",
            },
            {
                src: "/icons/icon-128x128.png",
                sizes: "128x128",
                type: "image/png",
                purpose: "maskable",
            },
            {
                src: "/icons/icon-144x144.png",
                sizes: "144x144",
                type: "image/png",
                purpose: "maskable",
            },
            {
                src: "/icons/icon-152x152.png",
                sizes: "152x152",
                type: "image/png",
                purpose: "maskable",
            },
            {
                src: "/icons/icon-192x192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "any",
            },
            {
                src: "/icons/icon-384x384.png",
                sizes: "384x384",
                type: "image/png",
                purpose: "any",
            },
            {
                src: "/icons/icon-512x512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "any",
            },
        ],
        screenshots: [
            {
                src: "/screenshots/home.png",
                sizes: "1280x720",
                type: "image/png",
                form_factor: "wide",
                label: "Fresh Pick Homepage",
            },
            {
                src: "/screenshots/products.png",
                sizes: "750x1334",
                type: "image/png",
                form_factor: "narrow",
                label: "Products Page",
            },
        ],
        shortcuts: [
            {
                name: "Shop Products",
                short_name: "Products",
                url: "/products",
                icons: [{ src: "/icons/icon-96x96.png", sizes: "96x96" }],
            },
            {
                name: "View Deals",
                short_name: "Deals",
                url: "/deals",
                icons: [{ src: "/icons/icon-96x96.png", sizes: "96x96" }],
            },
            {
                name: "My Orders",
                short_name: "Orders",
                url: "/orders",
                icons: [{ src: "/icons/icon-96x96.png", sizes: "96x96" }],
            },
        ],
    };
}
