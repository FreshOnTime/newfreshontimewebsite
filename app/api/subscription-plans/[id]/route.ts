import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import SubscriptionPlan from "@/lib/models/SubscriptionPlan";
import { requireAdmin, AdminRequest } from "@/lib/middleware/adminAuth";

// GET single subscription plan
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;

        const plan = await SubscriptionPlan.findById(id).lean();

        if (!plan) {
            return NextResponse.json(
                { success: false, message: "Subscription plan not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            plan,
        });
    } catch (error) {
        console.error("Error fetching subscription plan:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch subscription plan" },
            { status: 500 }
        );
    }
}

// PUT update subscription plan (admin only)
export const PUT = requireAdmin(async (
    request: AdminRequest,
    context: { params: Promise<{ id: string }> }
) => {
    try {
        await dbConnect();
        const { id } = await context.params;
        const body = await request.json();

        const plan = await SubscriptionPlan.findByIdAndUpdate(
            id,
            { ...body },
            { new: true, runValidators: true }
        );

        if (!plan) {
            return NextResponse.json(
                { success: false, message: "Subscription plan not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            plan,
        });
    } catch (error) {
        console.error("Error updating subscription plan:", error);
        return NextResponse.json(
            { success: false, message: "Failed to update subscription plan" },
            { status: 500 }
        );
    }
});

// DELETE subscription plan (admin only)
export const DELETE = requireAdmin(async (
    request: AdminRequest,
    context: { params: Promise<{ id: string }> }
) => {
    try {
        await dbConnect();
        const { id } = await context.params;

        const plan = await SubscriptionPlan.findByIdAndDelete(id);

        if (!plan) {
            return NextResponse.json(
                { success: false, message: "Subscription plan not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Subscription plan deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting subscription plan:", error);
        return NextResponse.json(
            { success: false, message: "Failed to delete subscription plan" },
            { status: 500 }
        );
    }
});
