import { randomUUID } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { fulfilmentOptions, makerImageSrc, makerKinds, makerSummarySelect } from '@/lib/makers';
import prisma from '@/lib/prisma';

const price = z.number().min(0.01).max(9999999999.99).multipleOf(0.01);
const dateTime = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Choose a Sri Lanka date and time')
  .refine(value => {
    const localClock = new Date(`${value}:00Z`);
    return !Number.isNaN(localClock.getTime()) && localClock.toISOString().slice(0, 16) === value;
  }, 'Choose a valid Sri Lanka date and time')
  .transform(value => new Date(`${value}:00+05:30`));
const id = z.string().min(1).max(100);
const actions = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('profile'),
    handle: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).min(3).max(50),
    bio: z.string().trim().max(1200),
    town: z.string().trim().min(2).max(100),
    phone: z.string().trim().max(32),
    fulfilment: z.enum(fulfilmentOptions),
    published: z.boolean(),
  }),
  z.object({
    action: z.literal('item'),
    id: id.optional(),
    name: z.string().trim().min(2).max(120),
    description: z.string().trim().min(2).max(2000),
    kind: z.enum(makerKinds),
    price: price.nullable(),
    image: z.string().max(2048).nullable().refine(value => value === null || !!makerImageSrc(value), 'Choose a valid item image'),
    madeToOrder: z.boolean(),
    published: z.boolean(),
  }),
  z.object({
    action: z.literal('batch'),
    itemId: id,
    note: z.string().trim().max(500),
    price,
    cutoff: dateTime,
    readyAt: dateTime,
  }),
  z.object({ action: z.literal('batch-status'), id, soldOut: z.boolean() }),
  z.object({
    action: z.literal('story'),
    id: id.optional(),
    title: z.string().trim().min(3).max(150),
    excerpt: z.string().trim().min(3).max(300),
    content: z.string().trim().min(3).max(18000),
    itemIds: z.array(id).max(10).transform(values => [...new Set(values)]),
    published: z.boolean(),
  }),
]);

function slugFor(title: string) {
  const prefix = title.normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 55).replace(/^-|-$/g, '');
  return `${prefix || 'freshpick'}-${randomUUID().slice(0, 12)}`;
}

async function approvedSupplier(userId: string, role: string) {
  if (role !== 'supplier') return null;
  const account = await prisma.user.findUnique({
    where: { id: userId },
    select: { supplier: { select: { ...makerSummarySelect, status: true, applicationStatus: true, makerPublished: true } } },
  });
  const supplier = account?.supplier;
  return supplier?.status === 'active' && supplier.applicationStatus === 'approved' ? supplier : null;
}

const fail = (error: string, status: number) => Response.json({ error }, { status });
const approvalRequired = () => fail('Your maker page needs approval before you can publish. Check your notifications for updates.', 403);
const missing = () => fail('This entry was not found in your maker studio.', 404);

export const GET = requireAuth(async request => {
  const supplier = await approvedSupplier(request.user!.userId, request.user!.role);
  if (!supplier) return approvalRequired();
  const [items, stories, catalogue] = await Promise.all([
    prisma.makerItem.findMany({
      where: { supplierId: supplier.id },
      orderBy: { createdAt: 'desc' },
      include: { batches: { where: { cutoff: { gt: new Date() } }, orderBy: { readyAt: 'asc' } } },
    }),
    prisma.blog.findMany({
      where: { supplierId: supplier.id, isDeleted: false },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, slug: true, title: true, excerpt: true, content: true, published: true, makerItems: { select: { itemId: true } } },
    }),
    prisma.product.findMany({
      where: { supplierId: supplier.id, archived: false },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, description: true, price: true, image: true },
    }),
  ]);
  return Response.json({ supplier, items, stories, catalogue }, { headers: { 'Cache-Control': 'private, no-store' } });
});

export const POST = requireAuth(async request => {
  const user = request.user!;
  const supplier = await approvedSupplier(user.userId, user.role);
  if (!supplier) return approvalRequired();
  const parsed = actions.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Check the submitted fields.', 400);
  const data = parsed.data;
  const supplierId = supplier.id;

  try {
    if (data.action === 'profile') {
      const phone = parsePhoneNumberFromString(data.phone, 'LK');
      if (!phone?.isValid()) return fail('Enter a valid public WhatsApp phone number.', 400);
      const updated = await prisma.supplier.updateMany({
        where: { id: supplierId, OR: [{ makerHandle: null }, { makerHandle: data.handle }] },
        data: {
          makerHandle: data.handle, makerBio: data.bio, makerTown: data.town,
          makerWhatsApp: phone.number, makerFulfilment: data.fulfilment, makerPublished: data.published,
        },
      });
      if (!updated.count) return fail('Your handle is permanent so shared links keep working.', 409);
      return Response.json({ ok: true });
    }

    if (!supplier.makerHandle) return fail('Save your maker profile first.', 409);

    switch (data.action) {
      case 'item': {
        const { id: itemId, name, description, kind, price, image, madeToOrder, published } = data;
        const fields = { name, description, kind, price, image, madeToOrder, published };
        if (!itemId) {
          await prisma.makerItem.create({ data: { ...fields, supplierId, slug: slugFor(fields.name) } });
          break;
        }
        const item = await prisma.makerItem.updateMany({ where: { id: itemId, supplierId }, data: fields });
        if (!item.count) return missing();
        break;
      }
      case 'batch': {
        if (data.cutoff <= new Date() || data.readyAt < data.cutoff) {
          return fail('Use a future preorder cutoff on or before the ready time.', 400);
        }
        const item = await prisma.makerItem.findFirst({
          where: { id: data.itemId, supplierId, published: true }, select: { id: true },
        });
        if (!item) return missing();
        await prisma.makerBatch.create({
          data: { itemId: item.id, note: data.note, price: data.price, cutoff: data.cutoff, readyAt: data.readyAt },
        });
        break;
      }
      case 'batch-status': {
        const batch = await prisma.makerBatch.updateMany({
          where: { id: data.id, item: { supplierId }, cutoff: { gt: new Date() } },
          data: { soldOut: data.soldOut },
        });
        if (!batch.count) return missing();
        break;
      }
      case 'story': {
        const result = await prisma.$transaction(async tx => {
          const items = await tx.makerItem.count({ where: { id: { in: data.itemIds }, supplierId } });
          if (items !== data.itemIds.length) return 'invalid-tags';

          const fields = {
            title: data.title, excerpt: data.excerpt, content: data.content,
            authorName: supplier.name, published: data.published,
          };
          const tags = data.itemIds.map(itemId => ({ itemId }));
          if (!data.id) {
            await tx.blog.create({
              data: {
                ...fields, supplierId, authorId: user.userId, slug: slugFor(data.title),
                publishedAt: data.published ? new Date() : null, makerItems: { create: tags },
              },
            });
            return 'saved';
          }

          const story = await tx.blog.findFirst({
            where: { id: data.id, supplierId, isDeleted: false },
            select: { id: true, published: true, publishedAt: true },
          });
          if (!story) return 'missing';
          await tx.blog.update({
            where: { id: story.id, supplierId, isDeleted: false },
            data: {
              ...fields, publishedAt: data.published ? (story.published ? story.publishedAt : new Date()) : null,
            },
          });
          await tx.makerStoryItem.deleteMany({ where: { storyId: story.id } });
          await tx.makerStoryItem.createMany({ data: tags.map(tag => ({ ...tag, storyId: story.id })) });
          return 'saved';
        });
        if (result === 'invalid-tags') return fail('Only tag items from your maker studio.', 400);
        if (result === 'missing') return missing();
        break;
      }
    }
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return fail(data.action === 'profile' ? 'That handle is already taken.' : 'This entry conflicts with another update. Please retry.', 409);
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') return missing();
    console.error('Maker publishing failed', error);
    return fail('Unable to save your changes. Please retry.', 500);
  }
});
