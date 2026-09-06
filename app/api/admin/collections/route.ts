import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { requireAdminSimple } from "@/lib/middleware/adminAuth";
import { collectionAdminInputSchema, serializeCollectionForAdmin } from "@/lib/collectionAdmin";
import { slugifyCollection, stringifyFoodCollectionContent } from "@/lib/collectionContent";

export const GET = requireAdminSimple(async (request) => {
  try {
    const page = Math.max(Number(request.nextUrl.searchParams.get("page") || 1), 1);
    const limit = Math.min(Math.max(Number(request.nextUrl.searchParams.get("limit") || 30), 1), 100);
    const search = request.nextUrl.searchParams.get("search")?.trim();
    const where: Prisma.BlogWhereInput = {
      category: "collection",
      isDeleted: false,
      ...(search ? { OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { excerpt: { contains: search, mode: "insensitive" as const } },
      ] } : {}),
    };
    const [rows, total] = await Promise.all([
      prisma.blog.findMany({ where, orderBy: { updatedAt: "desc" }, skip: (page - 1) * limit, take: limit }),
      prisma.blog.count({ where }),
    ]);
    return NextResponse.json({ collections: rows.map(serializeCollectionForAdmin), pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error("Get admin collections error:", error);
    return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 });
  }
});

export const POST = requireAdminSimple(async (request) => {
  try {
    const input = collectionAdminInputSchema.parse(await request.json());
    const slug = slugifyCollection(input.slug || input.title);
    if (!slug) return NextResponse.json({ error: "A valid collection slug is required" }, { status: 400 });
    if (await prisma.blog.findUnique({ where: { slug } })) return NextResponse.json({ error: "This slug is already in use" }, { status: 409 });

    const authorName = [request.user?.firstName, request.user?.lastName].filter(Boolean).join(" ");
    const data: Prisma.BlogUncheckedCreateInput = {
      title: input.title,
      slug,
      excerpt: input.excerpt,
      content: stringifyFoodCollectionContent(input.content),
      authorId: request.user!.userId,
      authorName: authorName || request.user?.email || "FreshPick",
      category: "collection",
      tags: input.tags,
      published: input.published,
      publishedAt: input.published ? new Date() : null,
      metaTitle: input.metaTitle || null,
      metaDescription: input.metaDescription || null,
      metaKeywords: input.metaKeywords,
    };
    if (input.featuredImage !== undefined) data.featuredImage = input.featuredImage as Prisma.InputJsonValue;
    const collection = await prisma.blog.create({ data });

    await prisma.auditLog.create({ data: {
      userId: request.user!.userId, action: "create", resourceType: "collection", resourceId: collection.id,
      after: { title: collection.title, slug: collection.slug, published: collection.published },
      ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    } }).catch(() => undefined);

    return NextResponse.json({ success: true, collection: serializeCollectionForAdmin(collection) }, { status: 201 });
  } catch (error) {
    console.error("Create collection error:", error);
    return NextResponse.json({ error: "Failed to create collection" }, { status: 400 });
  }
});
