import { NextRequest, NextResponse } from "next/server";

const BACKEND_DOMAIN = process.env.BACKEND_DOMAIN;

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await request.json();

    const response = await fetch(`${BACKEND_DOMAIN}/api/permissions/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error("Failed to update permission");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating permission:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update permission" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const response = await fetch(`${BACKEND_DOMAIN}/api/permissions/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete permission");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting permission:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete permission" },
      { status: 500 }
    );
  }
}
