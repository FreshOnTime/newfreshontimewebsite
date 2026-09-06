import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://freshpick.lk").replace(/\/$/, "");
const now = () => new Date();

function absoluteUrl(path = "") {
    return `${SITE_URL}${path}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticPages: MetadataRoute.Sitemap = [
        { url: absoluteUrl(), lastModified: now(), changeFrequency: "daily", priority: 1 },
        { url: absoluteUrl("/discover"), lastModified: now(), changeFrequency: "daily", priority: 0.95 },
        { url: absoluteUrl("/recipes"), lastModified: now(), changeFrequency: "daily", priority: 0.9 },
        { url: absoluteUrl("/collections"), lastModified: now(), changeFrequency: "daily", priority: 0.9 },
        { url: absoluteUrl("/products"), lastModified: now(), changeFrequency: "daily", priority: 0.9 },
        { url: absoluteUrl("/categories"), lastModified: now(), changeFrequency: "weekly", priority: 0.8 },
        { url: absoluteUrl("/deals"), lastModified: now(), changeFrequency: "daily", priority: 0.8 },
        { url: absoluteUrl("/meals"), lastModified: now(), changeFrequency: "daily", priority: 0.8 },
        { url: absoluteUrl("/about"), lastModified: now(), changeFrequency: "monthly", priority: 0.5 },
        { url: absoluteUrl("/contact"), lastModified: now(), changeFrequency: "monthly", priority: 0.5 },
        { url: absoluteUrl("/privacy"), lastModified: now(), changeFrequency: "yearly", priority: 0.3 },
        { url: absoluteUrl("/terms"), lastModified: now(), changeFrequency: "yearly", priority: 0.3 },
        { url: absoluteUrl("/subscriptions"), lastModified: now(), changeFrequency: "weekly", priority: 0.9 },
    ];

    let productPages: MetadataRoute.Sitemap = [];
    let categoryPages: MetadataRoute.Sitemap = [];
    let recipePages: MetadataRoute.Sitemap = [];
    let collectionPages: MetadataRoute.Sitemap = [];

    try {
        const [products, categories, recipes, collections] = await Promise.all([
            prisma.product.findMany({ where: { archived: false }, select: { sku: true, slug: true, updatedAt: true } }),
            prisma.category.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
            prisma.blog.findMany({ where: { category: "recipe", published: true, isDeleted: false }, select: { slug: true, updatedAt: true } }),
            prisma.blog.findMany({ where: { category: "collection", published: true, isDeleted: false }, select: { slug: true, updatedAt: true } }),
        ]);

        productPages = products.map((product) => ({
            url: absoluteUrl(`/products/${encodeURIComponent(product.sku || product.slug)}`),
            lastModified: product.updatedAt || now(),
            changeFrequency: "weekly" as const,
            priority: 0.7,
        }));
        categoryPages = categories.map((category) => ({
            url: absoluteUrl(`/categories/${encodeURIComponent(category.slug)}`),
            lastModified: category.updatedAt || now(),
            changeFrequency: "weekly" as const,
            priority: 0.6,
        }));
        recipePages = recipes.map((recipe) => ({
            url: absoluteUrl(`/recipes/${encodeURIComponent(recipe.slug)}`),
            lastModified: recipe.updatedAt || now(),
            changeFrequency: "weekly" as const,
            priority: 0.75,
        }));
        collectionPages = collections.map((collection) => ({
            url: absoluteUrl(`/collections/${encodeURIComponent(collection.slug)}`),
            lastModified: collection.updatedAt || now(),
            changeFrequency: "weekly" as const,
            priority: 0.75,
        }));
    } catch (error) {
        console.error("Error generating sitemap:", error);
    }

    return [...staticPages, ...collectionPages, ...recipePages, ...productPages, ...categoryPages];
}
