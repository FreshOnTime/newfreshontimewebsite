import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { requireAdminSimple } from "@/lib/middleware/adminAuth";
import { recipeAdminInputSchema, serializeRecipeForAdmin } from "@/lib/recipeAdmin";
import { slugifyRecipe, stringifyRecipeContent } from "@/lib/recipeContent";

export const GET = requireAdminSimple(async (request) => {
  try {
    const page = Math.max(Number(request.nextUrl.searchParams.get("page") || 1), 1);
    const limit = Math.min(Math.max(Number(request.nextUrl.searchParams.get("limit") || 30), 1), 100);
    const search = request.nextUrl.searchParams.get("search")?.trim();
    const where: Prisma.BlogWhereInput = {
      category: "recipe",
      isDeleted: false,
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" as const } },
              { excerpt: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [rows, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.blog.count({ where }),
    ]);

    return NextResponse.json({
      recipes: rows.map(serializeRecipeForAdmin),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Get admin recipes error:", error);
    return NextResponse.json({ error: "Failed to fetch recipes" }, { status: 500 });
  }
});

export const POST = requireAdminSimple(async (request) => {
  try {
    const input = recipeAdminInputSchema.parse(await request.json());
    const slug = slugifyRecipe(input.slug || input.title);
    if (!slug) {
      return NextResponse.json({ error: "A valid recipe slug is required" }, { status: 400 });
    }

    const existing = await prisma.blog.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "This slug is already in use" }, { status: 409 });
    }

    const authorName = [request.user?.firstName, request.user?.lastName].filter(Boolean).join(" ");
    const recipe = await prisma.blog.create({
      data: {
        title: input.title,
        slug,
        excerpt: input.excerpt,
        content: stringifyRecipeContent(input.content),
        featuredImage: input.featuredImage
          ? (input.featuredImage as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        authorId: request.user!.userId,
        authorName: authorName || request.user?.email || "FreshPick",
        category: "recipe",
        tags: input.tags,
        published: input.published,
        publishedAt: input.published ? new Date() : null,
        metaTitle: input.metaTitle || null,
        metaDescription: input.metaDescription || null,
        metaKeywords: input.metaKeywords,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: request.user!.userId,
        action: "create",
        resourceType: "recipe",
        resourceId: recipe.id,
        after: { title: recipe.title, slug: recipe.slug, published: recipe.published },
        ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    }).catch(() => undefined);

    return NextResponse.json(
      { success: true, recipe: serializeRecipeForAdmin(recipe) },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create recipe error:", error);
    return NextResponse.json({ error: "Failed to create recipe" }, { status: 400 });
  }
});
