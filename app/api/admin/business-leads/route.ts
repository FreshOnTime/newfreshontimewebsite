import { adminDataError } from '@/lib/adminApiErrors';
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdminSimple } from "@/lib/middleware/adminAuth";

const statuses = ["new", "contacted", "qualified", "won", "lost"] as const;
const querySchema=z.object({page:z.coerce.number().int().min(1).max(100000).default(1),status:z.enum(statuses).optional()});
const updateSchema = z.object({
  id: z.string().min(1),
  status: z.enum(statuses),
});

export const GET = requireAdminSimple(async (request: NextRequest) => {
  try {
    const parsed=querySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
    if(!parsed.success)return NextResponse.json({error:'Invalid partnership filters'},{status:400});
    const {page,status}=parsed.data;
    const where=status?{status}:undefined;
    const [leads,total]=await prisma.$transaction([
      prisma.businessLead.findMany({where,orderBy:[{createdAt:'desc'},{id:'desc'}],skip:(page-1)*20,take:20}),
      prisma.businessLead.count({where}),
    ]);
    return NextResponse.json({ success: true, leads: leads.map((lead) => ({ ...lead, _id: lead.id })),total,page,pages:Math.max(1,Math.ceil(total/20)) }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    return adminDataError(error, 'Unable to load partnership applications. Please try again.');
  }
});

export const PATCH = requireAdminSimple(async (request: NextRequest) => {
  try {
    const { id, status } = updateSchema.parse(await request.json());
    const lead = await prisma.businessLead.update({ where: { id }, data: { status } });
    return NextResponse.json({ success: true, lead: { ...lead, _id: lead.id } });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid lead update" }, { status: 400 });
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') return NextResponse.json({ error: 'Partnership application not found' }, { status: 404 });
    return adminDataError(error, 'Unable to update partnership status');
  }
});
