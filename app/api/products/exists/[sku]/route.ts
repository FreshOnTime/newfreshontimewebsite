import { NextResponse } from "next/server";

// Define the expected response type from the backend
interface SkuCheckResponse {
  success: boolean;
  message: string;
  data: boolean; // Assuming this is what the backend returns (true if SKU exists, false if not)
  metadata?: { timestamp: string };
}

// Environment variable validation
const BACKEND_DOMAIN = process.env.BACKEND_DOMAIN;

// Mark the route as dynamic to avoid sync/async mismatch
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ sku: string }> } // Type params as a Promise
) {
  try {
    // Await the params to resolve the Promise
    const resolvedParams = await params;
    const sku = resolvedParams.sku;

    // Validate SKU parameter
    if (!sku) {
      return NextResponse.json(
        { message: "SKU parameter is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${BACKEND_DOMAIN}/api/products/exists/${sku}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: req.headers.get("Authorization") || "",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text(); // Get raw text for more detail
      return NextResponse.json(
        { message: `Backend error: ${errorText || response.statusText}` },
        { status: response.status }
      );
    }

    const data: SkuCheckResponse = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error checking SKU existence:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
