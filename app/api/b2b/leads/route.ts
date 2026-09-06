import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/services/mailService";

const leadSchema = z.object({
  organizationName: z.string().trim().min(2).max(200),
  contactName: z.string().trim().min(2).max(200),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().min(6).max(40),
  requirement: z.string().trim().max(3000).optional().default(""),
});

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  }[character] || character));
}

export async function POST(request: Request) {
  try {
    const lead = leadSchema.parse(await request.json());
    const savedLead = await prisma.businessLead.create({ data: lead });

    const recipient = process.env.B2B_INQUIRY_EMAIL || "concierge@freshpick.lk";
    const details = [
      ["Organisation", lead.organizationName],
      ["Contact", lead.contactName],
      ["Email", lead.email],
      ["Phone", lead.phone],
      ["Partnership details", lead.requirement || "Not provided"],
    ].map(([label, value]) => `<p><strong>${label}:</strong> ${escapeHtml(value)}</p>`).join("");

    sendEmail(
      recipient,
      `New FreshPick partnership application: ${lead.organizationName}`,
      `<h2>New supplier / partnership application</h2>${details}`
    ).catch((error) => {
      console.error("[Partnership applications] Notification email failed:", error);
    });

    return NextResponse.json({ ok: true, leadId: savedLead.id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: "Please complete the required fields with valid details." }, { status: 400 });
    }
    console.error("[Partnership applications] Failed to create lead:", error);
    return NextResponse.json({ ok: false, error: "Unable to submit your application. Please try again." }, { status: 500 });
  }
}
