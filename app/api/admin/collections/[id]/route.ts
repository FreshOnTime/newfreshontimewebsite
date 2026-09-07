import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/middleware/adminAuth";
import { collectionAdminPatchSchema, serializeCollectionForAdmin } from "@/lib/collectionAdmin";
import { slugifyCollection, stringifyFoodCollectionContent } from "@/lib/collectionContent";

type Params = { id: string };

export const GET = requireAdmin<Params>(async (_request, context) => {
  try {
    const { id } = await context.params;
    const collection = await prisma.blog.findFirst({ where: { id, category: "collection", isDeleted: false } });
    if (!collection) return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    return NextResponse.json({ collection: serializeCollectionForAdmin(collection) });
  } catch (error) {
    console.error("Get admin collection error:", error);
    return NextResponse.json({ error: "Failed to fetch collection" }, { status: 500 });
  }
});

export const PATCH = requireAdmin<Params>(async (request, context) => {
  try {
    const { id } = await context.params;
    const input = collectionAdminPatchSchema.parse(await request.json());
    const current = await prisma.blog.findFirst({ where: { id, category: "collection", isDeleted: false } });
    if (!current) return NextResponse.json({ error: "Collection not found" }, { status: 404 });

    let nextSlug = current.slug;
    if (input.slug !== undefined) {
      nextSlug = slugifyCollection(input.slug);
      if (!nextSlug) return NextResponse.json({ error: "A valid slug is required" }, { status: 400 });
      if (await prisma.blog.findFirst({ where: { slug: nextSlug, id: { not: id } }, select: { id: true } })) {
        return NextResponse.json({ error: "This slug is already in use" }, { status: 409 });
      }
    }

    const data: Prisma.BlogUpdateInput = {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.slug !== undefined ? { slug: nextSlug } : {}),
      ...(input.excerpt !== undefined ? { excerpt: input.excerpt } : {}),
      ...(input.content !== undefined ? { content: stringifyFoodCollectionContent(input.content) } : {}),
      ...(input.featuredImage !== undefined ? { featuredImage: input.featuredImage as Prisma.InputJsonValue } : {}),
      ...(input.tags !== undefined ? { tags: input.tags } : {}),
      ...(input.metaTitle !== undefined ? { metaTitle: input.metaTitle || null } : {}),
      ...(input.metaDescription !== undefined ? { metaDescription: input.metaDescription || null } : {}),
      ...(input.metaKeywords !== undefined ? { metaKeywords: input.metaKeywords } : {}),
    };
    if (input.published !== undefined) {
      data.published = input.published;
      data.publishedAt = input.published ? current.publishedAt || new Date() : null;
    }
    const updated = await prisma.blog.update({ where: { id }, data });

    await prisma.auditLog.create({ data: {
      userId: request.user!.userId, action: "update", resourceType: "collection", resourceId: id,
      before: { title: current.title, slug: current.slug, published: current.published },
      after: { title: updated.title, slug: updated.slug, published: updated.published },
      ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    } }).catch(() => undefined);

    return NextResponse.json({ success: true, collection: serializeCollectionForAdmin(updated) });
  } catch (error) {
    console.error("Update collection error:", error);
    return NextResponse.json({ error: "Failed to update collection" }, { status: 400 });
  }
});

export const DELETE = requireAdmin<Params>(async (request, context) => {
  try {
    const { id } = await context.params;
    const current = await prisma.blog.findFirst({ where: { id, category: "collection", isDeleted: false }, select: { id: true, title: true, slug: true } });
    if (!current) return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    await prisma.blog.update({ where: { id }, data: { isDeleted: true, published: false } });
    await prisma.auditLog.create({ data: {
      userId: request.user!.userId, action: "delete", resourceType: "collection", resourceId: id, before: current,
      ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    } }).catch(() => undefined);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete collection error:", error);
    return NextResponse.json({ error: "Failed to delete collection" }, { status: 500 });
  }
});
