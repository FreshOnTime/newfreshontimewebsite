import { MetadataRoute } from "next";
import dbConnect from "@/lib/database";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://freshpick.lk";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: SITE_URL,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1,
        },
        {
            url: `${SITE_URL}/products`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: `${SITE_URL}/categories`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
        },
        {
            url: `${SITE_URL}/deals`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.8,
        },
        {
            url: `${SITE_URL}/about`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.5,
        },
        {
            url: `${SITE_URL}/contact`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.5,
        },
        {
            url: `${SITE_URL}/privacy`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.3,
        },
        {
            url: `${SITE_URL}/terms`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.3,
        },
    ];

    let productPages: MetadataRoute.Sitemap = [];
    let categoryPages: MetadataRoute.Sitemap = [];

    try {
        await dbConnect();

        // Dynamically import models to avoid circular dependencies
        const { default: ProductModel } = await import("@/lib/models/Product");
        const { default: CategoryModel } = await import("@/lib/models/Category");

        // Fetch products
        const products = await ProductModel.find({}, "sku updatedAt").lean();
        productPages = products.map((product) => ({
            url: `${SITE_URL}/products/${product.sku}`,
            lastModified: product.updatedAt || new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.7,
        }));

        // Fetch categories
        const categories = await CategoryModel.find({}, "slug updatedAt").lean();
        categoryPages = categories.map((category) => ({
            url: `${SITE_URL}/categories/${category.slug}`,
            lastModified: category.updatedAt || new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.6,
        }));
    } catch (error) {
        console.error("Error generating sitemap:", error);
        // Continue with static pages only if DB fails
    }

    return [...staticPages, ...productPages, ...categoryPages];
}
