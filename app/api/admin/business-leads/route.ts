import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdminSimple } from "@/lib/middleware/adminAuth";

const statuses = ["new", "contacted", "qualified", "won", "lost"] as const;
const updateSchema = z.object({
  id: z.string().min(1),
  status: z.enum(statuses),
});

export const GET = requireAdminSimple(async (request: NextRequest) => {
  const status = new URL(request.url).searchParams.get("status");
  const where = status && statuses.includes(status as (typeof statuses)[number]) ? { status } : undefined;

  const leads = await prisma.businessLead.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ success: true, leads: leads.map((lead) => ({ ...lead, _id: lead.id })) });
});

export const PATCH = requireAdminSimple(async (request: NextRequest) => {
  try {
    const { id, status } = updateSchema.parse(await request.json());
    const lead = await prisma.businessLead.update({ where: { id }, data: { status } });
    return NextResponse.json({ success: true, lead: { ...lead, _id: lead.id } });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid lead update" }, { status: 400 });
    return NextResponse.json({ error: "Unable to update lead" }, { status: 500 });
  }
});
